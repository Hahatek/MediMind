using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs.ChangeRequest;
using Backend.Helpers;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChangeRequestController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IFamilyAccessService _familyAccessService;
    
    public ChangeRequestController(AppDbContext context, IFamilyAccessService familyAccessService)
    {
        _context = context;
        _familyAccessService = familyAccessService;
    }
    
    [HttpPost]
    public async Task<ActionResult<ResponseChangeRequestDto>> PostChangeRequest(CreateChangeRequestDto dto)
    {
        var userId = this.GetUserId();
        
        var examination = await _context.Examinations
            .FirstOrDefaultAsync(e => e.Id == dto.ExaminationId);
        if (examination == null)
        {
            return NotFound($"Nie znaleziono badania o id {dto.ExaminationId}");
        }

        var visibleUserId = await _familyAccessService.GetVisibleUserIdsAsync(userId);

        if (!visibleUserId.Contains(examination.UserId))
        {
            return Forbid();
        }
        
        var changeRequest = new ChangeRequest()
        {
            Id = Guid.NewGuid(),
            ExaminationId = dto.ExaminationId,
            RequestedBy = this.GetUserId(),
            Status = ChangeRequestStatus.Pending,
            ProposedChanges = dto.ProposedChanges,
            Reason = dto.Reason,
            CreatedAt = DateTime.UtcNow,
        };
        
        _context.ChangeRequests.Add(changeRequest);
        await _context.SaveChangesAsync();
        
        await _context.Entry(changeRequest).Reference(cr => cr.Examination).LoadAsync();
        await _context.Entry(changeRequest).Reference(cr => cr.CreatedBy).LoadAsync();
        
        return Ok(ToResponseDto(changeRequest));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ResponseChangeRequestDto>>> GetChangeRequest()
    {
        var userId = this.GetUserId();
        var changeRequest = await _context.ChangeRequests
            .Include(r => r.Examination)
            .Include(r => r.CreatedBy)
            .Include(r => r.Reviewer)
            .Where(r => r.RequestedBy == userId || r.Examination.UserId == userId)
            .ToListAsync();

        return Ok(changeRequest.Select(ToResponseDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseChangeRequestDto>> GetChangeRequest(Guid id)
    {
        var userId = this.GetUserId();
        var changeRequest = await _context.ChangeRequests
            .Include(r => r.Examination)
            .Include(r => r.CreatedBy)
            .Include(r => r.Reviewer)
            .FirstOrDefaultAsync(r => r.Id == id && (r.RequestedBy == userId || r.Examination.UserId == userId));
        
        if (changeRequest == null)
        {
            return NotFound($"Nie znaleziono prośby o zmianę badania o id {id}");
        }

        return Ok(ToResponseDto(changeRequest));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ResponseChangeRequestDto>> PutChangeRequest(Guid id, UpdateChangeRequestDto dto)
    {
        var userId = this.GetUserId();
        var changeRequest = await _context.ChangeRequests
            .Include(cr => cr.Examination)
            .Include(cr => cr.CreatedBy)
            .Include(cr => cr.Reviewer)
            .FirstOrDefaultAsync(cr => cr.Id == id && cr.RequestedBy == userId);
        if (changeRequest == null)
        {
            return NotFound($"Nie znaleziono wniosku o zmianę o id {id}");
        }

        if (changeRequest.Status != ChangeRequestStatus.Pending)
        {
            return BadRequest("Nie można edytować");
        }
        
        changeRequest.ProposedChanges = dto.ProposedChanges;
        changeRequest.Reason = dto.Reason;

        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(changeRequest));
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<ResponseChangeRequestDto>> PatchChangeRequest(Guid id, PatchChangeRequestDto dto)
    {
        var userId = this.GetUserId();
        var changeRequest = await _context.ChangeRequests
            .Include(cr => cr.Examination)
            .Include(cr => cr.CreatedBy)
            .Include(cr => cr.Reviewer)
            .FirstOrDefaultAsync(cr => cr.Id == id && cr.RequestedBy == userId);

        if (changeRequest == null)
        {
            return NotFound($"Nie znaleziono wniosku o zmianę o id {id}");
        }

        if (changeRequest.Status != ChangeRequestStatus.Pending)
        {
            return BadRequest("Nie można edytować wniosku, który został już rozpatrzony");
        }

        if (dto.ProposedChanges is not null)
        {
            changeRequest.ProposedChanges = dto.ProposedChanges;
        }

        if (dto.Reason is not null)
        {
            changeRequest.Reason = dto.Reason;
        }

        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(changeRequest));
    }

    [HttpPost("{id}/review")]
    public async Task<ActionResult<ResponseChangeRequestDto>> ReviewChangeRequest(Guid id, ReviewChangeRequestDto dto)
    {
        var userId = this.GetUserId();
        var changeRequest = await _context.ChangeRequests
            .Include(cr => cr.Examination)
            .Include(cr => cr.CreatedBy)
            .Include(cr => cr.Reviewer)
            .FirstOrDefaultAsync(cr => cr.Id == id);

        if (changeRequest == null)
        {
            return NotFound("Nie znaleziono wniosku");
        }

        var isOwner = changeRequest.Examination.UserId == userId;
        var isParent = await _familyAccessService.IsParentOfChildAsync(userId, changeRequest.Examination.UserId);
        if (!isOwner && !isParent)
        {
            return NotFound("Nie znaleziono wniosku");
        }

        if (changeRequest.Status != ChangeRequestStatus.Pending)
        {
            return BadRequest("Wniosek zotał rozpatrzony");
        }

        if (dto.Status == ChangeRequestStatus.Pending)
        {
            return BadRequest("Nieprawidłowy status");
        }
        
        changeRequest.Status = dto.Status;
        changeRequest.ReviewedBy = userId;
        changeRequest.ReviewedAt =  DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await _context.Entry(changeRequest).Reference(cr => cr.Reviewer).LoadAsync();

        return Ok(ToResponseDto(changeRequest));
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteChangeRequest(Guid id)
    {
        var userId = this.GetUserId();
        var changeRequest = await _context.ChangeRequests
            .FirstOrDefaultAsync(cr => cr.Id == id && cr.RequestedBy == userId);
        
        if (changeRequest == null)
        {
            return NotFound($"Nie znaleziono wniosku o zmianę o id {id}");
        }

        if (changeRequest.Status != ChangeRequestStatus.Pending)
        {
            return BadRequest("Nie można usunąć wniosku");
        }

        _context.ChangeRequests.Remove(changeRequest);
        await _context.SaveChangesAsync();

        return NoContent();
    }
    
    private static ResponseChangeRequestDto ToResponseDto(ChangeRequest cr)
    {
        return new ResponseChangeRequestDto
        {
            Id = cr.Id,
            ExaminationId = cr.ExaminationId,
            RequestedBy = cr.RequestedBy,
            ReviewedBy = cr.ReviewedBy,
            Status = cr.Status,
            ProposedChanges = cr.ProposedChanges,
            Reason = cr.Reason,
            ReviewedAt = cr.ReviewedAt,
            CreatedAt = cr.CreatedAt,
            Examination = cr.Examination?.Name,
            CreatedBy = $"{cr.CreatedBy.FirstName} {cr.CreatedBy.LastName}",
            Reviewer = cr.Reviewer != null ? $"{cr.Reviewer.FirstName} {cr.Reviewer.LastName}" : null,
        };
    }   
}