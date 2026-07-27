using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs.FamilyMember;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FamilyMemberController : ControllerBase
{
    private readonly AppDbContext _context;

    public FamilyMemberController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ResponseFamilyMemberDto>>> GetFamilyMembers()
    {
        var familyMembers = await _context.FamilyMembers
            .Include(fm => fm.Member)
            .ToListAsync();

        return Ok(familyMembers.Select(ToResponseDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseFamilyMemberDto>> GetFamilyMember(Guid id)
    {
        var familyMember = await _context.FamilyMembers
            .Include(fm => fm.Member)
            .FirstOrDefaultAsync(fm => fm.Id == id);
        if (familyMember == null)
        {
            return NotFound($"Nie znaleziono powiązania rodzinnego o id {id}");
        }

        return Ok(ToResponseDto(familyMember));
    }

    [HttpPost]
    public async Task<ActionResult<ResponseFamilyMemberDto>> PostFamilyMember(CreateFamilyMemberDto dto)
    {
        var familyMember = new FamilyMember()
        {
            Id = Guid.NewGuid(),
            OwnerId = dto.OwnerId,
            MemberId = dto.MemberId,
            Relation = dto.Relation,
            CanEdit = dto.CanEdit,
            CreatedAt = DateTime.UtcNow,
        };
        _context.FamilyMembers.Add(familyMember);
        await _context.SaveChangesAsync();

        await _context.Entry(familyMember).Reference(fm => fm.Member).LoadAsync();

        return Ok(ToResponseDto(familyMember));
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<ResponseFamilyMemberDto>> PatchFamilyMember(Guid id, PatchFamilyMemberDto dto)
    {
        var familyMember = await _context.FamilyMembers
            .Include(fm => fm.Member)
            .FirstOrDefaultAsync(fm => fm.Id == id);
        if (familyMember == null)
        {
            return NotFound($"Nie znaleziono powiązania rodzinnego o id {id}");
        }

        if (dto.Relation is not null) familyMember.Relation = dto.Relation;
        if (dto.CanEdit.HasValue) familyMember.CanEdit = dto.CanEdit.Value;

        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(familyMember));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFamilyMember(Guid id)
    {
        var familyMember = await _context.FamilyMembers.FindAsync(id);
        if (familyMember == null)
        {
            return NotFound($"Nie znaleziono powiązania rodzinnego o id {id}");
        }

        _context.FamilyMembers.Remove(familyMember);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static ResponseFamilyMemberDto ToResponseDto(FamilyMember fm)
    {
        return new ResponseFamilyMemberDto()
        {
            Id = fm.Id,
            OwnerId = fm.OwnerId,
            MemberId = fm.MemberId,
            Relation = fm.Relation,
            CanEdit = fm.CanEdit,
            CreatedAt = fm.CreatedAt,
            MemberFirstName = fm.Member.FirstName,
            MemberLastName = fm.Member.LastName,
        };
    }

}
