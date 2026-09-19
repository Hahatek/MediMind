using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs.Examination;
using Backend.Helpers;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ExaminationController : ControllerBase
{
    
    private readonly AppDbContext _context;
    private readonly IGoogleCalendarService _googleCalendarService;
    private readonly IFamilyAccessService _familyAccessService;
    
    public ExaminationController(AppDbContext context, IGoogleCalendarService googleCalendarService, IFamilyAccessService familyAccessService)
    {
        _context = context;
        _googleCalendarService = googleCalendarService;
        _familyAccessService = familyAccessService;
    }

    [HttpPost] // CreateExamination
    public async Task<ActionResult<ResponseExaminationDto>> PostExamination(CreateExaminationDto dto)
    {
        
        var userId = this.GetUserId();
        var userRole = this.GetUserRole();
        
        if (userRole == RoleUser.Child)
        {
            return Forbid();
        }
        
        var targetUserId = dto.ForUserId ?? userId; // pomaga nam to określić dla kogo tworzymy badanie
        
        if (targetUserId != userId && !await _familyAccessService.IsParentOfChildAsync(userId, dto.ForUserId.Value))
        {
            return Forbid();   
        }
        
        var examination = new Examination
        {
            Id = Guid.NewGuid(),
            UserId = targetUserId,
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
        
        await _googleCalendarService.CreateEventAsyncExamination(examination);
        
        await _context.SaveChangesAsync();
        
        return Ok(ToResponseDto(examination));
    }

    [HttpGet] // ResponseExamination
    public async Task<ActionResult<IEnumerable<ResponseExaminationDto>>> GetExaminations()
    {
        var userId = this.GetUserId();
        var visibleUserIds = await _familyAccessService
            .GetVisibleUserIdsAsync(userId);
        var examinations = await _context.Examinations
            .Where(e => visibleUserIds.Contains(e.UserId))
            .Where(e => !_context.ExaminationsHide.Any(h => h.ExaminationId == e.Id && h.HiddenForUserId == userId))
            .ToListAsync();

        return Ok(examinations.Select(ToResponseDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseExaminationDto>> GetExamination(Guid id)
    {
        var userId = this.GetUserId();
        var visibleUserIds = await _familyAccessService.GetVisibleUserIdsAsync(userId);
        var examination = await _context.Examinations
            .Where(e => e.Id == id && visibleUserIds.Contains(e.UserId))
            .Where(e => !_context.ExaminationsHide.Any(h => h.ExaminationId == e.Id && h.HiddenForUserId == userId))
            .FirstOrDefaultAsync();
        if (examination == null)
        {
            return NotFound($"Nie znaleziono badania o id {id}");
        }
        
        return Ok(ToResponseDto(examination));
    }
    
    [HttpPut("{id}")] // UpdateExaminationDto
    public async Task<ActionResult<ResponseExaminationDto>> PutExamination(Guid id, UpdateExaminationDto dto)
    {
        var userId = this.GetUserId();

        if (this.GetUserRole() == RoleUser.Child)
        {
            return Forbid();
        }

        var examination = await _context.Examinations
            .FirstOrDefaultAsync(e => e.Id == id );
        
         if (examination == null)
        {
            return NotFound($"Nie znaleziono badania o id {id}");
        }
         
        var isOwner = examination.UserId == userId;
        var isParent = await _familyAccessService.IsParentOfChildAsync(userId, examination.UserId);

        if (!isOwner && !isParent)
        {
            return NotFound("Nie znaleziono badania");
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

        await _googleCalendarService.UpdateEventAsyncExamination(examination);
        
        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(examination));
    }

    [HttpPatch("{id}")] // PatchExamination
    public async Task<ActionResult<ResponseExaminationDto>> PatchExamination(Guid id, PatchExaminationDto dto)
    {
        var userId = this.GetUserId();

        if (this.GetUserRole() == RoleUser.Child)
        {
            return Forbid();
        }

        var examination = await _context.Examinations
            .FirstOrDefaultAsync(e => e.Id == id);
        
        if (examination == null)
        {
            return NotFound($"Nie znaleziono badania o id {id}");
        }
        
        var isOwner = examination.UserId == userId;
        var isParent = await _familyAccessService.IsParentOfChildAsync(userId, examination.UserId);

        if (!isOwner && !isParent)
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

        await _googleCalendarService.UpdateEventAsyncExamination(examination);
        
        await _context.SaveChangesAsync();
        
        return Ok(ToResponseDto(examination));
    }

    [HttpDelete("{id}")] // DeleteExamination
    public async Task<IActionResult> DeleteExamination(Guid id)
    {
        var userId = this.GetUserId();

        if (this.GetUserRole() == RoleUser.Child)
        {
            return Forbid();
        }

        var examination = await _context.Examinations
            .FirstOrDefaultAsync(e => e.Id == id);
        
        if (examination == null)
        {
            return NotFound($"Nie znaleziono badania o id {id}");
        }

        var isOwner = examination.UserId == userId;
        var isParent = await _familyAccessService.IsParentOfChildAsync(userId, examination.UserId);

        if (!isOwner && !isParent)
        {
            return NotFound($"Nie znaleziono badania o id {id}");
        }
        
        await _googleCalendarService.DeleteEventAsyncExamination(examination);
        
        _context.Examinations.Remove(examination);
        
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/hide/{hiddenForUserId}")]
    public async Task<IActionResult> HideExamination(Guid id, Guid hiddenForUserId)
    {
        var userId = this.GetUserId();

        if (this.GetUserRole() == RoleUser.Child)
        {
            return Forbid();
        }

        var examination = await _context.Examinations.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
        if (examination == null)
        {
            return NotFound($"Nie znaleziono badania o id {id}");
        }

        if (hiddenForUserId == userId)
        {
            return BadRequest("Nie można ukryć badania przed samym sobą");
        }
        
        var visibleUserIds = await _familyAccessService.GetVisibleUserIdsAsync(userId);
        if (!visibleUserIds.Contains(hiddenForUserId))
        {
            return BadRequest("Ta osoba nie jest w twojej rodzinie");
        }
        
        var aleardyHidden = await _context.ExaminationsHide
            .AnyAsync(h => h.ExaminationId == id && h.HiddenForUserId == hiddenForUserId);
        if (aleardyHidden)
        {
            return BadRequest("Baddanie jest ukryte");
        }

        _context.ExaminationsHide.Add(new ExaminationHide
        {
            Id = Guid.NewGuid(),
            ExaminationId = id,
            HiddenForUserId = hiddenForUserId,
            HiddenByUserId = userId,
            CreatedAt = DateTime.UtcNow,
        });
        
        await _context.SaveChangesAsync();
        
        return  (Ok(ToResponseDto(examination)));
    }

    [HttpDelete("{id}/hide/{hiddenForUserId}")]
    public async Task<IActionResult> UnhideExamination(Guid id, Guid hiddenForUserId)
    {
        var userId = this.GetUserId();
        
        var examination = await _context.Examinations
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
        if (examination == null)
        {
            return NotFound($"Nie znaleziono badania");
        }
        
        var hide = await _context.ExaminationsHide
            .FirstOrDefaultAsync(e => e.ExaminationId == id && e.HiddenForUserId == hiddenForUserId);
        if (hide == null)
        {
            return NotFound($"Nie znaleziono badania");
        }
        
        _context.ExaminationsHide.Remove(hide);
        await _context.SaveChangesAsync();
        
        return Ok(ToResponseDto(examination));
    }
    
    private static ResponseExaminationDto ToResponseDto(Examination e)
    {
        return new ResponseExaminationDto
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


    
