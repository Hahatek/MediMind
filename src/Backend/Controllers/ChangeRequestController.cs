using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs.ChangeRequest;
using Backend.Models;
namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChangeRequestController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public ChangeRequestController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult<ResponseChangeRequestDto>> PostChangeRequest(CreateChangeRequestDto dto)
    {
        var changeRequest = new ChangeRequest()
        {
            Id = Guid.NewGuid(),
            ExaminationId = dto.ExaminationId,
            RequestedBy = dto.RequestedBy,
            Status = dto.Status,
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
        var changeRequest = await _context.ChangeRequests
            .Include(r => r.Examination)
            .Include(r => r.CreatedBy)
            .Include(r => r.Reviewer)
            .ToListAsync();

        return Ok(changeRequest.Select(ToResponseDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseChangeRequestDto>> GetChangeRequest(Guid id)
    {
        var changeRequest = await _context.ChangeRequests
            .Include(r => r.Examination)
            .Include(r => r.CreatedBy)
            .Include(r => r.Reviewer)
            .FirstOrDefaultAsync(r => r.Id == id);
        if (changeRequest == null)
        {
            return NotFound($"Nie znaleziono prośby o zmianę badania o id {id}");
        }
        
        return Ok(ToResponseDto(changeRequest));
    }
    
    [HttpPut("{id}")]
    public async Task<ActionResult<ResponseChangeRequestDto>> PutChangeRequest(Guid id, UpdateChangeRequestDto dto)
    {
        var changeRequest = await _context.ChangeRequests
            .Include(cr => cr.Examination)
            .Include(cr => cr.CreatedBy)
            .Include(cr => cr.Reviewer)
            .FirstOrDefaultAsync(cr => cr.Id == id);
        if (changeRequest == null)
        {
            return NotFound($"Nie znaleziono wniosku o zmianę o id {id}");
        }

        changeRequest.Status = dto.Status;
        changeRequest.ProposedChanges = dto.ProposedChanges;
        changeRequest.Reason = dto.Reason;

        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(changeRequest));
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<ResponseChangeRequestDto>> PatchChangeRequest(Guid id, PatchChangeRequestDto dto)
    {
        var changeRequest = await _context.ChangeRequests
            .Include(cr => cr.Examination)
            .Include(cr => cr.CreatedBy)
            .Include(cr => cr.Reviewer)
            .FirstOrDefaultAsync(cr => cr.Id == id);

        if (changeRequest == null)
            return NotFound($"Nie znaleziono wniosku o zmianę o id {id}");

        if (dto.ReviewedBy.HasValue) changeRequest.ReviewedBy = dto.ReviewedBy.Value;
        if (dto.Status.HasValue) changeRequest.Status = dto.Status.Value;
        if (dto.ProposedChanges is not null) changeRequest.ProposedChanges = dto.ProposedChanges;
        if (dto.Reason is not null) changeRequest.Reason = dto.Reason;
        if (dto.ReviewedAt.HasValue) changeRequest.ReviewedAt = dto.ReviewedAt.Value;

        await _context.SaveChangesAsync();

        if (dto.ReviewedBy.HasValue)
            await _context.Entry(changeRequest).Reference(cr => cr.Reviewer).LoadAsync();

        return Ok(ToResponseDto(changeRequest));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteChangeRequest(Guid id)
    {
        var changeRequest = await _context.ChangeRequests.FindAsync(id);
        if (changeRequest == null)
        {
            return NotFound($"Nie znaleziono wniosku o zmianę o id {id}");
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