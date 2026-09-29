using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs.Medication;
using Backend.DTOs.MedicationSchedule;
using Backend.Helpers;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MedicationController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IGoogleCalendarService _googleCalendarService;
    private readonly IFamilyAccessService _familyAccessService;

    public MedicationController(AppDbContext context, IGoogleCalendarService googleCalendarService, IFamilyAccessService familyAccessService)
    {
        _context = context;
        _googleCalendarService = googleCalendarService;
        _familyAccessService = familyAccessService;
    }

    [HttpPost]
    public async Task<ActionResult<ResponseMedicationDto>> PostMedication(CreateMedicationDto dto)
    {
        var userId = this.GetUserId();

        if (this.GetUserRole() == RoleUser.Child)
        {
            return Forbid();
        }

        var targetUserId = dto.ForUserId ?? userId;

        if (targetUserId != userId && !await _familyAccessService.IsParentOfChildAsync(userId, targetUserId))
        {
            return Forbid();
        }

        var dateError = ValidateDates(dto.StartDate, dto.EndDate, null);
        if (dateError != null)
        {
            return BadRequest(dateError);
        }

        // Wszystkie pory walidujemy przed zapisem — błąd którejkolwiek odrzuca cały request
        var scheduleDtos = dto.Schedules ?? new List<NewMedicationScheduleDto>();
        if (scheduleDtos.Any(s => s == null))
        {
            return BadRequest("Pora przyjmowania nie może być pusta");
        }

        // Ta sama reguła duplikatu co w MedicationScheduleController: ta sama TimeOfDay i ta sama godzina
        var hasDuplicate = scheduleDtos
            .GroupBy(s => new { s.TimeOfDay, s.Time })
            .Any(g => g.Count() > 1);
        if (hasDuplicate)
        {
            return Conflict("Ten lek ma już taką porę przyjmowania");
        }

        var medication = new Medication
        {
            Id = Guid.NewGuid(),
            UserId = targetUserId,
            Name = dto.Name,
            Strength = NormalizeStrength(dto.Strength),
            Form = dto.Form,
            Notes = dto.Notes,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
        };

        foreach (var s in scheduleDtos)
        {
            medication.MedicationSchedules.Add(new MedicationSchedule
            {
                Id = Guid.NewGuid(),
                MedicationId = medication.Id,
                TimeOfDay = s.TimeOfDay,
                Time = s.Time,
                Amount = s.Amount,
                Medication = medication,
            });
        }

        // Jeden SaveChanges = jedna transakcja: zapisze się lek razem ze wszystkimi porami albo nic
        _context.Medications.Add(medication);
        await _context.SaveChangesAsync();

        // Google Calendar dopiero po zapisie kompletnego leku. Błąd Google nie cofa zapisu w bazie —
        // CreateEvent sam ustawia SyncStatus = Failed i LastSyncError, a drugi SaveChanges to utrwala.
        if (medication.MedicationSchedules.Count > 0)
        {
            foreach (var schedule in medication.MedicationSchedules)
            {
                await _googleCalendarService.CreateEventAsyncMedicationSchedule(schedule);
            }

            await _context.SaveChangesAsync();
        }

        return Ok(ToResponseDto(medication));
    }

    // Lista leków jednej osoby ("kartka na lodówce") razem z porami przyjmowania.
    // date = lokalna data z telefonu, na jej podstawie liczony jest status leku.
    // scope: Active = Planned + Active (aktualna lista), History = Finished + Discontinued, All = wszystko.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MedicationListItemDto>>> GetMedications(
        [FromQuery] Guid? userId, [FromQuery] DateOnly? date, [FromQuery] MedicationListScope scope = MedicationListScope.Active)
    {
        var callerId = this.GetUserId();
        var targetUserId = userId ?? callerId;

        if (targetUserId != callerId)
        {
            var visibleUserIds = await _familyAccessService.GetVisibleUserIdsAsync(callerId);
            if (!visibleUserIds.Contains(targetUserId))
            {
                return Forbid();
            }
        }

        if (!date.HasValue)
        {
            return BadRequest("Brak daty");
        }

        var day = date.Value;

        var medications = await _context.Medications
            .Include(m => m.MedicationSchedules)
            .Where(m => m.UserId == targetUserId)
            .ToListAsync();

        var result = medications
            .Select(m => new { Medication = m, Status = m.GetStatusOn(day) })
            .Where(x => scope switch
            {
                MedicationListScope.Active => x.Status is MedicationStatus.Active or MedicationStatus.Planned,
                MedicationListScope.History => x.Status is MedicationStatus.Finished or MedicationStatus.Discontinued,
                _ => true,
            })
            .OrderBy(x => x.Medication.Name)
            .Select(x => ToListItemDto(x.Medication, x.Status))
            .ToList();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseMedicationDto>> GetMedication(Guid id)
    {
        var userId = this.GetUserId();
        var visibleUserIds = await _familyAccessService.GetVisibleUserIdsAsync(userId);

        var medication = await _context.Medications
            .FirstOrDefaultAsync(m => m.Id == id && visibleUserIds.Contains(m.UserId));

        if (medication == null)
        {
            return NotFound($"Nie znaleziono leku o id {id}");
        }

        return Ok(ToResponseDto(medication));
    }

    // PUT nadpisuje wszystkie pola (null czyści Notes/StartDate/EndDate). DiscontinuedOn zostaje bez zmian.
    [HttpPut("{id}")]
    public async Task<ActionResult<ResponseMedicationDto>> PutMedication(Guid id, UpdateMedicationDto dto)
    {
        var userId = this.GetUserId();

        if (this.GetUserRole() == RoleUser.Child)
        {
            return Forbid();
        }

        var medication = await _context.Medications
            .Include(m => m.MedicationSchedules)
            .FirstOrDefaultAsync(m => m.Id == id);
        if (medication == null)
        {
            return NotFound($"Nie znaleziono leku o id {id}");
        }

        var isOwner = medication.UserId == userId;
        var isParent = await _familyAccessService.IsParentOfChildAsync(userId, medication.UserId);
        if (!isOwner && !isParent)
        {
            return NotFound($"Nie znaleziono leku o id {id}");
        }

        var dateError = ValidateDates(dto.StartDate, dto.EndDate, medication.DiscontinuedOn);
        if (dateError != null)
        {
            return BadRequest(dateError);
        }

        var strength = NormalizeStrength(dto.Strength);

        bool calendarRelevantChange = medication.Name != dto.Name
            || medication.Strength != strength
            || medication.Form != dto.Form
            || medication.Notes != dto.Notes
            || medication.StartDate != dto.StartDate
            || medication.EndDate != dto.EndDate;

        medication.Name = dto.Name;
        medication.Strength = strength;
        medication.Form = dto.Form;
        medication.Notes = dto.Notes;
        medication.StartDate = dto.StartDate;
        medication.EndDate = dto.EndDate;

        if (calendarRelevantChange)
        {
            foreach (var schedule in medication.MedicationSchedules)
            {
                await _googleCalendarService.UpdateEventAsyncMedicationSchedule(schedule);
            }
        }

        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(medication));
    }

    // PATCH tylko ustawia podane pola (null = "nie zmieniaj"). Czyszczenie pól — przez PUT.
    [HttpPatch("{id}")]
    public async Task<ActionResult<ResponseMedicationDto>> PatchMedication(Guid id, PatchMedicationDto dto)
    {
        var userId = this.GetUserId();

        if (this.GetUserRole() == RoleUser.Child)
        {
            return Forbid();
        }

        var medication = await _context.Medications
            .Include(m => m.MedicationSchedules)
            .FirstOrDefaultAsync(m => m.Id == id);
        if (medication == null)
        {
            return NotFound($"Nie znaleziono leku o id {id}");
        }

        var isOwner = medication.UserId == userId;
        var isParent = await _familyAccessService.IsParentOfChildAsync(userId, medication.UserId);
        if (!isOwner && !isParent)
        {
            return NotFound($"Nie znaleziono leku o id {id}");
        }

        if ((dto.Name is not null && string.IsNullOrWhiteSpace(dto.Name))
            || (dto.Strength is not null && string.IsNullOrWhiteSpace(dto.Strength))
            || (dto.Form is not null && string.IsNullOrWhiteSpace(dto.Form)))
        {
            return BadRequest("Nazwa, moc i postać leku nie mogą być puste (moc można wyczyścić przez PUT)");
        }

        var newStartDate = dto.StartDate ?? medication.StartDate;
        var newEndDate = dto.EndDate ?? medication.EndDate;
        var dateError = ValidateDates(newStartDate, newEndDate, medication.DiscontinuedOn);
        if (dateError != null)
        {
            return BadRequest(dateError);
        }

        bool calendarRelevantChange = (dto.Name is not null && dto.Name != medication.Name)
            || (dto.Strength is not null && dto.Strength != medication.Strength)
            || (dto.Form is not null && dto.Form != medication.Form)
            || (dto.Notes is not null && dto.Notes != medication.Notes)
            || newStartDate != medication.StartDate
            || newEndDate != medication.EndDate;

        if (dto.Name is not null) medication.Name = dto.Name;
        if (dto.Strength is not null) medication.Strength = dto.Strength;
        if (dto.Form is not null) medication.Form = dto.Form;
        if (dto.Notes is not null) medication.Notes = dto.Notes;
        medication.StartDate = newStartDate;
        medication.EndDate = newEndDate;

        if (calendarRelevantChange)
        {
            foreach (var schedule in medication.MedicationSchedules)
            {
                await _googleCalendarService.UpdateEventAsyncMedicationSchedule(schedule);
            }
        }

        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(medication));
    }

    // Normalny sposób zakończenia stosowania leku — lek i historia przyjęć zostają w bazie.
    [HttpPost("{id}/discontinue")]
    public async Task<ActionResult<ResponseMedicationDto>> DiscontinueMedication(Guid id, DiscontinueMedicationDto dto)
    {
        var userId = this.GetUserId();

        if (this.GetUserRole() == RoleUser.Child)
        {
            return Forbid();
        }

        var medication = await _context.Medications
            .Include(m => m.MedicationSchedules)
            .FirstOrDefaultAsync(m => m.Id == id);
        if (medication == null)
        {
            return NotFound($"Nie znaleziono leku o id {id}");
        }

        var isOwner = medication.UserId == userId;
        var isParent = await _familyAccessService.IsParentOfChildAsync(userId, medication.UserId);
        if (!isOwner && !isParent)
        {
            return NotFound($"Nie znaleziono leku o id {id}");
        }

        if (medication.DiscontinuedOn != null)
        {
            return Conflict("Lek jest już odstawiony");
        }

        var date = dto.Date!.Value;

        var dateError = ValidateDates(medication.StartDate, medication.EndDate, date);
        if (dateError != null)
        {
            return BadRequest(dateError);
        }

        medication.DiscontinuedOn = date;

        foreach (var schedule in medication.MedicationSchedules)
        {
            await _googleCalendarService.UpdateEventAsyncMedicationSchedule(schedule);
        }

        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(medication));
    }

    // Cofnięcie pomyłkowego odstawienia — ten sam lek, dane i historia bez zmian.
    [HttpPost("{id}/resume")]
    public async Task<ActionResult<ResponseMedicationDto>> ResumeMedication(Guid id)
    {
        var userId = this.GetUserId();

        if (this.GetUserRole() == RoleUser.Child)
        {
            return Forbid();
        }

        var medication = await _context.Medications
            .Include(m => m.MedicationSchedules)
            .FirstOrDefaultAsync(m => m.Id == id);
        if (medication == null)
        {
            return NotFound($"Nie znaleziono leku o id {id}");
        }

        var isOwner = medication.UserId == userId;
        var isParent = await _familyAccessService.IsParentOfChildAsync(userId, medication.UserId);
        if (!isOwner && !isParent)
        {
            return NotFound($"Nie znaleziono leku o id {id}");
        }

        if (medication.DiscontinuedOn == null)
        {
            return Conflict("Lek nie jest odstawiony");
        }

        medication.DiscontinuedOn = null;

        // Seria w kalendarzu wraca do granic z StartDate/EndDate (usunięte wydarzenie zostanie utworzone od nowa)
        foreach (var schedule in medication.MedicationSchedules)
        {
            await _googleCalendarService.UpdateEventAsyncMedicationSchedule(schedule);
        }

        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(medication));
    }

    // Usuwanie służy tylko do poprawienia pomyłki. Lek z historią przyjęć trzeba odstawić (/discontinue).
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMedication(Guid id)
    {
        var userId = this.GetUserId();

        if (this.GetUserRole() == RoleUser.Child)
        {
            return Forbid();
        }

        var medication = await _context.Medications
            .Include(m => m.MedicationSchedules)
            .FirstOrDefaultAsync(m => m.Id == id);
        if (medication == null)
        {
            return NotFound($"Nie znaleziono leku o id {id}");
        }

        var isOwner = medication.UserId == userId;
        var isParent = await _familyAccessService.IsParentOfChildAsync(userId, medication.UserId);
        if (!isOwner && !isParent)
        {
            return NotFound($"Nie znaleziono leku o id {id}");
        }

        var hasHistory = await _context.MedicationIntakes
            .AnyAsync(mi => mi.MedicationSchedule.MedicationId == id);
        if (hasHistory)
        {
            return Conflict("Lek ma historię przyjęć — zamiast usuwać, odstaw go");
        }

        foreach (var schedule in medication.MedicationSchedules)
        {
            await _googleCalendarService.DeleteEventAsyncMedicationSchedule(schedule);
        }

        _context.Medications.Remove(medication);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static string? ValidateDates(DateOnly? startDate, DateOnly? endDate, DateOnly? discontinuedOn)
    {
        if (startDate != null && endDate != null && endDate < startDate)
        {
            return "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia";
        }

        if (discontinuedOn != null && startDate != null && discontinuedOn < startDate)
        {
            return "Data odstawienia nie może być wcześniejsza niż data rozpoczęcia";
        }

        if (discontinuedOn != null && endDate != null && discontinuedOn > endDate)
        {
            return "Data odstawienia nie może być późniejsza niż data zakończenia";
        }

        return null;
    }

    // Moc jest opcjonalna — pusty napis zapisujemy jako null, żeby "brak mocy" miał jedną postać w bazie.
    private static string? NormalizeStrength(string? strength)
    {
        return string.IsNullOrWhiteSpace(strength) ? null : strength;
    }

    private static ResponseMedicationDto ToResponseDto(Medication m)
    {
        return new ResponseMedicationDto()
        {
            Id = m.Id,
            UserId = m.UserId,
            Name = m.Name,
            Strength = m.Strength,
            Form = m.Form,
            Notes = m.Notes,
            StartDate = m.StartDate,
            EndDate = m.EndDate,
            DiscontinuedOn = m.DiscontinuedOn,
        };
    }

    private static MedicationListItemDto ToListItemDto(Medication m, MedicationStatus status)
    {
        return new MedicationListItemDto()
        {
            Id = m.Id,
            UserId = m.UserId,
            Name = m.Name,
            Strength = m.Strength,
            Form = m.Form,
            Notes = m.Notes,
            StartDate = m.StartDate,
            EndDate = m.EndDate,
            DiscontinuedOn = m.DiscontinuedOn,
            Status = status,
            Schedules = m.MedicationSchedules
                .OrderBy(s => s.TimeOfDay).ThenBy(s => s.Time)
                .Select(MedicationScheduleController.ToResponseDto)
                .ToList(),
        };
    }
}
