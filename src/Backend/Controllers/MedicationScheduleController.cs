using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs.MedicationSchedule;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MedicationScheduleController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IGoogleCalendarService _googleCalendarService;

    public MedicationScheduleController(AppDbContext context, IGoogleCalendarService googleCalendarService)
    {
        _context = context;
        _googleCalendarService = googleCalendarService;
    }

    [HttpPost]
    public async Task<ActionResult<ResponseMedicationScheduleDto>> PostMedicationSchedule(CreateMedicationScheduleDto dto)
    {
        var medication = await _context.Medications.FindAsync(dto.MedicationId);
        if (medication == null)
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
        var medicationschedules = await _context.MedicationSchedules.ToListAsync();

        return Ok(medicationschedules.Select(ToResponseDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseMedicationScheduleDto>> GetMedicationSchedule(Guid id)
    {
        var medicationschedule = await _context.MedicationSchedules.FindAsync(id);
        if (medicationschedule == null)
        {
            return NotFound($"Nie znaleziono badania o id {id}");
        }
        
        return Ok(ToResponseDto(medicationschedule));
    }
    
    [HttpPut("{id}")]
    public async Task<ActionResult<ResponseMedicationScheduleDto>> PutMedicationSchedule(Guid id, UpdateMedicationScheduleDto dto)
    {
        var medicationschedule = await _context.MedicationSchedules
            .Include(ms => ms.Medication)
            .FirstOrDefaultAsync(ms => ms.Id == id);
        if (medicationschedule == null)
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
        var medicationschedule = await _context.MedicationSchedules
            .Include(ms => ms.Medication)
            .FirstOrDefaultAsync(ms => ms.Id == id);
        if (medicationschedule == null)
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
        var medicationschedule = await _context.MedicationSchedules
            .Include(ms => ms.Medication)
            .FirstOrDefaultAsync(ms => ms.Id == id);
        if (medicationschedule == null)
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