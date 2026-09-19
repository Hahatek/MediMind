using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs.MedicationSchedule;
using Backend.Helpers;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MedicationScheduleController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IGoogleCalendarService _googleCalendarService;
    private readonly IFamilyAccessService _familyAccessService;

    public MedicationScheduleController(AppDbContext context, IGoogleCalendarService googleCalendarService, IFamilyAccessService familyAccessService)
    {
        _context = context;
        _googleCalendarService = googleCalendarService;
        _familyAccessService = familyAccessService;
    }

    [HttpPost]
    public async Task<ActionResult<ResponseMedicationScheduleDto>> PostMedicationSchedule(CreateMedicationScheduleDto dto)
    {
        var userId = this.GetUserId();

        if (this.GetUserRole() == RoleUser.Child)
        {
            return Forbid();
        }

        var medication = await _context.Medications
            .FindAsync(dto.MedicationId);
        if (medication == null)
        {
            return NotFound($"Nie znaleziono leku o id {dto.MedicationId}");
        }

        var isOwner = medication.UserId == userId;
        var isParent = await _familyAccessService.IsParentOfChildAsync(userId, medication.UserId);
        if (!isOwner && !isParent)
        {
            return NotFound($"Nie znaleziono leku o id {dto.MedicationId}");
        }

        var medicationschedule = new MedicationSchedule()
        {
            Id = Guid.NewGuid(),
            MedicationId = dto.MedicationId,
            TimeOfDay = dto.TimeOfDay,
            Time = dto.Time,
            Medication = medication,
        };

        _context.MedicationSchedules.Add(medicationschedule);
        
        await _googleCalendarService.CreateEventAsyncMedicationSchedule(medicationschedule);
        
        await _context.SaveChangesAsync();
        
        return Ok(ToResponseDto(medicationschedule));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ResponseMedicationScheduleDto>>> GetMedicationSchedule()
    {
        var userId = this.GetUserId();
        var medicationschedules = await _context.MedicationSchedules
            .Where(ms => ms.Medication.UserId == userId)
            .ToListAsync();

        return Ok(medicationschedules.Select(ToResponseDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseMedicationScheduleDto>> GetMedicationSchedule(Guid id)
    {
        var userId = this.GetUserId();
        var medicationschedule = await _context.MedicationSchedules
            .Include(ms => ms.Medication)
            .FirstOrDefaultAsync(ms => ms.Id == id && ms.Medication.UserId == userId);
        if (medicationschedule == null)
        {
            return NotFound($"Nie znaleziono harmonogramu leku o id {id}");
        }
        
        return Ok(ToResponseDto(medicationschedule));
    }
    
    [HttpPut("{id}")]
    public async Task<ActionResult<ResponseMedicationScheduleDto>> PutMedicationSchedule(Guid id, UpdateMedicationScheduleDto dto)
    {
        var userId = this.GetUserId();

        if (this.GetUserRole() == RoleUser.Child)
        {
            return Forbid();
        }

        var medicationschedule = await _context.MedicationSchedules
            .Include(ms => ms.Medication)
            .FirstOrDefaultAsync(ms => ms.Id == id);
        if (medicationschedule == null)
        {
            return NotFound($"Nie znaleziono pory przyjmowania leku o id {id}");
        }

        var isOwner = medicationschedule.Medication.UserId == userId;
        var isParent = await _familyAccessService.IsParentOfChildAsync(userId, medicationschedule.Medication.UserId);
        if (!isOwner && !isParent)
        {
            return NotFound($"Nie znaleziono pory przyjmowania leku o id {id}");
        }

        if (dto.MedicationId != medicationschedule.MedicationId)
        {
            var medication = await _context.Medications.FindAsync(dto.MedicationId);
            if (medication == null)
            {
                return NotFound($"Nie znaleziono leku o id {dto.MedicationId}");
            }
            var isOwnerOfNew = medication.UserId == userId;
            var isParentOfNew = await _familyAccessService.IsParentOfChildAsync(userId, medication.UserId);
            if (!isOwnerOfNew && !isParentOfNew)
            {
                return NotFound($"Nie znaleziono leku o id {dto.MedicationId}");
            }
            medicationschedule.MedicationId = dto.MedicationId;
            medicationschedule.Medication = medication;
        }
        medicationschedule.TimeOfDay = dto.TimeOfDay;
        medicationschedule.Time = dto.Time;

        await _googleCalendarService.UpdateEventAsyncMedicationSchedule(medicationschedule);

        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(medicationschedule));
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<ResponseMedicationScheduleDto>> PatchMedicationSchedule(Guid id, PatchMedicationScheduleDto dto)
    {
        var userId = this.GetUserId();

        if (this.GetUserRole() == RoleUser.Child)
        {
            return Forbid();
        }

        var medicationschedule = await _context.MedicationSchedules
            .Include(ms => ms.Medication)
            .FirstOrDefaultAsync(ms => ms.Id == id);
        if (medicationschedule == null)
        {
            return NotFound($"Nie znaleziono pory przyjmowania leku o id {id}");
        }

        var isOwner = medicationschedule.Medication.UserId == userId;
        var isParent = await _familyAccessService.IsParentOfChildAsync(userId, medicationschedule.Medication.UserId);
        if (!isOwner && !isParent)
        {
            return NotFound($"Nie znaleziono pory przyjmowania leku o id {id}");
        }

        if (dto.MedicationId is not null && dto.MedicationId != medicationschedule.MedicationId)
        {
            var medication = await _context.Medications.FindAsync(dto.MedicationId);
            if (medication == null)
            {
                return NotFound($"Nie znaleziono leku o id {dto.MedicationId}");
            }
            var isOwnerOfNew = medication.UserId == userId;
            var isParentOfNew = await _familyAccessService.IsParentOfChildAsync(userId, medication.UserId);
            if (!isOwnerOfNew && !isParentOfNew)
            {
                return NotFound($"Nie znaleziono leku o id {dto.MedicationId}");
            }
            medicationschedule.MedicationId = (Guid)dto.MedicationId;
            medicationschedule.Medication = medication;
        }
        if (dto.TimeOfDay.HasValue) medicationschedule.TimeOfDay = dto.TimeOfDay.Value;
        if (dto.Time.HasValue) medicationschedule.Time = dto.Time.Value;

        await _googleCalendarService.UpdateEventAsyncMedicationSchedule(medicationschedule);
        
        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(medicationschedule));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMedicationSchedule(Guid id)
    {
        var userId = this.GetUserId();

        if (this.GetUserRole() == RoleUser.Child)
        {
            return Forbid();
        }

        var medicationschedule = await _context.MedicationSchedules
            .Include(ms => ms.Medication)
            .FirstOrDefaultAsync(ms => ms.Id == id);
        if (medicationschedule == null)
        {
            return NotFound($"Nie znaleziono pory przyjmowania leku o id {id}");
        }

        var isOwner = medicationschedule.Medication.UserId == userId;
        var isParent = await _familyAccessService.IsParentOfChildAsync(userId, medicationschedule.Medication.UserId);
        if (!isOwner && !isParent)
        {
            return NotFound($"Nie znaleziono pory przyjmowania leku o id {id}");
        }

        await _googleCalendarService.DeleteEventAsyncMedicationSchedule(medicationschedule);
        
        _context.MedicationSchedules.Remove(medicationschedule);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static ResponseMedicationScheduleDto ToResponseDto(MedicationSchedule ms)
    {
        return new ResponseMedicationScheduleDto
        {
            Id = ms.Id,
            MedicationId = ms.MedicationId,
            TimeOfDay = ms.TimeOfDay,
            Time = ms.Time,
        };
    }
}