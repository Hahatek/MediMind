using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs.Medication;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MedicationController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IGoogleCalendarService _googleCalendarService;

    public MedicationController(AppDbContext context, IGoogleCalendarService googleCalendarService)
    {
        _context = context;
        _googleCalendarService = googleCalendarService;
    }

    [HttpPost]
    public async Task<ActionResult<ResponseMedicationDto>> PostMedication(CreateMedicationDto dto)
    {
        var medication = new Medication
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            Name = dto.Name,
            Dose = dto.Dose,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
        };
        _context.Medications.Add(medication);
        await _context.SaveChangesAsync();
        
        return Ok(ToResponseDto(medication));
    }
   
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ResponseMedicationDto>>> GetMedications()
    {
        var medication = await _context.Medications.ToListAsync();

        return Ok(medication.Select(ToResponseDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseMedicationDto>> GetMedication(Guid id)
    {
        var medication = await _context.Medications.FindAsync(id);
        if (medication == null)
        {
            return NotFound($"Nie znaleziono leku o id {id}");
        }
        
        return Ok(ToResponseDto(medication));
    }
   
    [HttpPut("{id}")]
    public async Task<ActionResult<ResponseMedicationDto>> PutMedication(Guid id, UpdateMedicationDto dto)
    {
        var medication = await _context.Medications
            .Include(m => m.MedicationSchedules)
            .ThenInclude(ms => ms.Medication)
            .FirstOrDefaultAsync(m => m.Id == id);
        if (medication == null)
        {
            return NotFound($"Nie znaleziono leku o id {id}");
        }

        bool calendarRelevantChange = medication.Name != dto.Name
            || medication.Dose != dto.Dose
            || medication.StartDate != dto.StartDate
            || medication.EndDate != dto.EndDate;

        medication.Name = dto.Name;
        medication.StartDate = dto.StartDate;
        medication.EndDate = dto.EndDate;
        medication.Dose = dto.Dose;

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

    [HttpPatch("{id}")]
    public async Task<ActionResult<ResponseMedicationDto>> PatchMedication(Guid id, PatchMedicationDto dto)
    {
        var medication = await _context.Medications
            .Include(m => m.MedicationSchedules)
            .ThenInclude(ms => ms.Medication)
            .FirstOrDefaultAsync(m => m.Id == id);
        if (medication == null)
        {
            return NotFound($"Nie znaleziono leku o id {id}");
        }

        bool calendarRelevantChange = (dto.Name is not null && dto.Name != medication.Name)
            || (dto.Dose.HasValue && dto.Dose.Value != medication.Dose)
            || (dto.StartDate.HasValue && dto.StartDate.Value != medication.StartDate)
            || (dto.EndDate.HasValue && dto.EndDate.Value != medication.EndDate);

        if (dto.Name is not null) medication.Name = dto.Name;
        if (dto.Dose.HasValue) medication.Dose = dto.Dose.Value;
        if (dto.StartDate.HasValue) medication.StartDate = dto.StartDate.Value;
        if (dto.EndDate.HasValue) medication.EndDate = dto.EndDate.Value;

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

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMedication(Guid id)
    {
        var medication = await _context.Medications
            .Include(m => m.MedicationSchedules)
            .ThenInclude(ms => ms.Medication)
            .FirstOrDefaultAsync(m => m.Id == id);
        if (medication == null)
        {
            return NotFound($"Nie znaleziono leku o id {id}");
        }

        foreach (var schedule in medication.MedicationSchedules)
        {
            await _googleCalendarService.DeleteEventAsyncMedicationSchedule(schedule);
        }

        _context.Medications.Remove(medication);
        await _context.SaveChangesAsync();

        return NoContent();
    }
    
    private static ResponseMedicationDto ToResponseDto(Medication m)
    {
        return new ResponseMedicationDto()
        {
            Id = m.Id,
            UserId = m.UserId,
            Name = m.Name,
            Dose = m.Dose,
            StartDate = m.StartDate,
            EndDate = m.EndDate,
        };
    }
    
}