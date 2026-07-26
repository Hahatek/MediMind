using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs.Examination;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExaminationController : ControllerBase
{
    
    private readonly AppDbContext _context;
    
    public ExaminationController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult<ExaminationResponseDto>> PostExamination(CreateExaminationDto dto)
    {
        var examination = new Examination
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            Date = dto.Date,
            Time = dto.Time,
            Name = dto.Name,
            Description = dto.Description,
            Location = dto.Location,
            Status = dto.Status,
            IsCyclic = dto.IsCyclic,
            CycleInterval = dto.CycleInterval,
            Preparation = dto.Preparation,
            Color = dto.Color,
            Icon = dto.Icon,
            Doctor = dto.Doctor
        };
        _context.Examinations.Add(examination);
        await _context.SaveChangesAsync();
        
        return Ok(ToResponseDto(examination));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExaminationResponseDto>>> GetExaminations()
    {
        var examinations = await _context.Examinations.ToListAsync();

        return Ok(examinations.Select(ToResponseDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExaminationResponseDto>> GetExamination(Guid id)
    {
        var examination = await _context.Examinations.FindAsync(id);
        if (examination == null)
        {
            return NotFound($"Nie znaleziono badania o id {id}");
        }
        
        return Ok(ToResponseDto(examination));
    }
    
    [HttpPut("{id}")]
    public async Task<ActionResult<ExaminationResponseDto>> PutExamination(Guid id, UpdateExaminationDto dto)
    {
        var examination = await _context.Examinations.FindAsync(id);
        if (examination == null)
        {
            return NotFound($"Nie znaleziono badania o id {id}");
        }

        examination.Name = dto.Name;
        examination.Date = dto.Date;
        examination.Time = dto.Time;
        examination.Description = dto.Description;
        examination.Location = dto.Location;
        if (dto.Status.HasValue)
        {
            examination.Status = dto.Status.Value;
        }
        examination.IsCyclic = dto.IsCyclic;
        examination.CycleInterval = dto.CycleInterval;
        examination.Preparation = dto.Preparation;
        examination.Color = dto.Color;
        examination.Icon = dto.Icon;
        examination.Doctor = dto.Doctor;

        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(examination));
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<ExaminationResponseDto>> PatchExamination(Guid id, PatchExaminationDto dto)
    {
        var examination = await _context.Examinations.FindAsync(id);
        if (examination == null)
        {
            return NotFound($"Nie znaleziono badania o id {id}");
        }

        if (dto.Name is not null) examination.Name = dto.Name;
        if (dto.Date.HasValue) examination.Date = dto.Date.Value;
        if (dto.Time.HasValue) examination.Time = dto.Time.Value;
        if (dto.Description is not null) examination.Description = dto.Description;
        if (dto.Location is not null) examination.Location = dto.Location;
        if (dto.Status.HasValue) examination.Status = dto.Status.Value;
        if (dto.IsCyclic.HasValue) examination.IsCyclic = dto.IsCyclic.Value;
        if (dto.CycleInterval.HasValue) examination.CycleInterval = dto.CycleInterval.Value;
        if (dto.Preparation is not null) examination.Preparation = dto.Preparation;
        if (dto.Color is not null) examination.Color = dto.Color;
        if (dto.Icon is not null) examination.Icon = dto.Icon;
        if (dto.Doctor is not null) examination.Doctor = dto.Doctor;

        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(examination));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExamination(Guid id)
    {
        var examination = await _context.Examinations.FindAsync(id);
        if (examination == null)
        {
            return NotFound($"Nie znaleziono badania o id {id}");
        }

        _context.Examinations.Remove(examination);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static ExaminationResponseDto ToResponseDto(Examination e)
    {
        return new ExaminationResponseDto
        {
            Id = e.Id,
            UserId = e.UserId,
            Date = e.Date,
            Time = e.Time,
            Name = e.Name,
            Description = e.Description,
            Location = e.Location,
            Status = e.Status,
            IsCyclic = e.IsCyclic,
            CycleInterval = e.CycleInterval,
            Preparation = e.Preparation,
            Color = e.Color,
            Icon = e.Icon,
            Doctor = e.Doctor,
            GoogleEventId = e.GoogleEventId
        };
    }
}


    
