using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs.MedicationIntake;
using Backend.Helpers;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MedicationIntakeController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IFamilyAccessService _familyAccessService;

    public MedicationIntakeController(AppDbContext context, IFamilyAccessService familyAccessService)
    {
        _context = context;
        _familyAccessService = familyAccessService;
    }

    // Zaznacza przyjęcie (albo pominięcie) konkretnej dawki danego dnia.
    // Celowo BEZ blokady roli Child — dziecko może zaznaczyć przyjęcie WŁASNEGO leku,
    // mimo że nie może zarządzać samym lekiem (patrz MedicationController).
    [HttpPost]
    public async Task<ActionResult<ResponseMedicationIntakeDto>> PostMedicationIntake(CreateMedicationIntakeDto dto)
    {
        var userId = this.GetUserId();

        var schedule = await _context.MedicationSchedules
            .Include(ms => ms.Medication)
            .FirstOrDefaultAsync(ms => ms.Id == dto.MedicationScheduleId);
        if (schedule == null)
        {
            return NotFound($"Nie znaleziono harmonogramu o id {dto.MedicationScheduleId}");
        }

        var isOwner = schedule.Medication.UserId == userId;
        var isParent = await _familyAccessService.IsParentOfChildAsync(userId, schedule.Medication.UserId);
        if (!isOwner && !isParent)
        {
            return NotFound($"Nie znaleziono dawki leku o id {dto.MedicationScheduleId}");
        }

        if (!dto.Date.HasValue)
        {
            return BadRequest("Brak daty dawki");
        }

        var date = dto.Date.Value;

        var todayUtc = DateOnly.FromDateTime(DateTime.UtcNow);
        if (date < todayUtc.AddDays(-1) || date > todayUtc.AddDays(1))
        {
            return BadRequest("Można potwierdzić tylko dawkę z dzisiejszego dnia");
        }

        var existing = await _context.MedicationIntakes
            .FirstOrDefaultAsync(mi => mi.MedicationScheduleId == dto.MedicationScheduleId && mi.Date == date);
        if (existing != null)
        {
            return Ok(ToResponseDto(existing));
        }
        
        
        var intake = new MedicationIntake
        {
            Id = Guid.NewGuid(),
            MedicationScheduleId = dto.MedicationScheduleId,
            UserId = schedule.Medication.UserId,
            Date = date,
            Status = dto.Status,
            RecordedAt = DateTime.UtcNow,
            RecordedByUserId = userId,

        };
        _context.MedicationIntakes.Add(intake);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            _context.Entry(intake).State = EntityState.Detached;

            var saved = await _context.MedicationIntakes
                .FirstOrDefaultAsync(mi => mi.MedicationScheduleId == dto.MedicationScheduleId && mi.Date == date);
            if (saved == null)
            {
                throw; 
            }

            return Ok(ToResponseDto(saved));
        }

        return Ok(ToResponseDto(intake));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMedicationIntake(Guid id)
    {
        var userId = this.GetUserId();

        var intake = await _context.MedicationIntakes
            .FirstOrDefaultAsync(mi => mi.Id == id);
        if (intake == null)
        {
            return NotFound($"Nie znaleziono wpisu o id {id}");
        }
        
        var isOwner = intake.UserId == userId;
        var isParent = await _familyAccessService.IsParentOfChildAsync(userId, intake.UserId);
        if (!isOwner && !isParent)
        {
            return NotFound($"Nie znaleziono dawki leku");
        }

        _context.MedicationIntakes.Remove(intake);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ResponseMedicationIntakeDto>>> GetMedicationIntakes(
        [FromQuery] DateOnly? from, [FromQuery] DateOnly? to, [FromQuery] Guid? userId)
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

        var rangeTo = to ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var rangeFrom = from ?? rangeTo.AddDays(-30);

        var intakes = await _context.MedicationIntakes
            .Where(mi => mi.UserId == targetUserId && mi.Date >= rangeFrom && mi.Date <= rangeTo)
            .OrderByDescending(mi => mi.Date)
            .ToListAsync();

        return Ok(intakes.Select(ToResponseDto));
    }

    [HttpGet("today")]
    public async Task<ActionResult<IEnumerable<TodayMedicationIntakeDto>>>GetTodayMedicationIntakes([FromQuery] Guid? userId, [FromQuery] DateOnly? date)
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
            return BadRequest("Brak daty dawki");
        }

        var day = date.Value;

        var todayUtc = DateOnly.FromDateTime(DateTime.UtcNow);

        if (date < todayUtc.AddDays(-1) || date > todayUtc.AddDays(1))
        {
            return BadRequest("Można potwierdzić tylko dawkę z dzisiejszego dnia");
        }
        
        var schedules = await _context.MedicationSchedules
            .Include(ms => ms.Medication)
            .Where(ms => ms.Medication.UserId == targetUserId)
            .Where(ms => (ms.Medication.StartDate == null || ms.Medication.StartDate <= day)
                         && (ms.Medication.EndDate == null || ms.Medication.EndDate >= day))
            .ToListAsync();

        var scheduleIds = schedules.Select(s => s.Id).ToList();
        var todaysIntakes = await _context.MedicationIntakes
            .Where(mi => scheduleIds.Contains(mi.MedicationScheduleId) && mi.Date == day)
            .ToListAsync();
        
        var result = schedules.Select(s =>
        {
            var intake = todaysIntakes.FirstOrDefault(mi => mi.MedicationScheduleId == s.Id);
            return new TodayMedicationIntakeDto
            {
                MedicationScheduleId = s.Id,
                MedicationId = s.MedicationId,
                MedicationName = s.Medication.Name,
                TimeOfDay = s.TimeOfDay,
                Time = s.Time,
                Status = intake == null
                    ? TodayIntakeStatus.Pending
                    : (intake.Status == IntakeStatus.Taken ? TodayIntakeStatus.Taken : TodayIntakeStatus.Skipped),
                IntakeId = intake?.Id,
            };
        }).OrderBy(d => d.TimeOfDay).ThenBy(d => d.Time).ToList();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseMedicationIntakeDto>> GetMedicationIntake(Guid id)
    {
        var callerId = this.GetUserId();
        var visibleUserIds = await _familyAccessService.GetVisibleUserIdsAsync(callerId);

        var intake = await _context.MedicationIntakes
            .FirstOrDefaultAsync(mi => mi.Id == id && visibleUserIds.Contains(mi.UserId));
       
        if (intake == null)
        {
            return NotFound($"Nie znaleziono wpisu o id {id}");
        }

        return Ok(ToResponseDto(intake));
    }
    
    private static ResponseMedicationIntakeDto ToResponseDto(MedicationIntake mi)
    {
        return new ResponseMedicationIntakeDto
        {
            Id = mi.Id,
            MedicationScheduleId = mi.MedicationScheduleId,
            UserId = mi.UserId,
            Date = mi.Date,
            Status = mi.Status,
            RecordedAt = mi.RecordedAt,
            RecordedByUserId = mi.RecordedByUserId
        };
    }
}
