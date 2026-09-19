using Backend.Data;
using Backend.DTOs.Family;
using Backend.Helpers;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FamilyController : ControllerBase
{
    
    private readonly AppDbContext _context; 
    private readonly IFamilyAccessService _familyAccessService;
    
    public FamilyController(AppDbContext context, IFamilyAccessService familyAccessService)
    {
        _context = context;
        _familyAccessService = familyAccessService;
    }

    [HttpPost]
    public async Task<ActionResult<ResponseFamilyDto>> PostFamily()
    {
        var userId = this.GetUserId();
        
        if (this.GetUserRole() == RoleUser.Child)
        {
            return Forbid();
        }
        
        var family = new Family { Id = Guid.NewGuid(), CreatedAt = DateTime.UtcNow };
            var membership = new FamilyMembership
            {
                Id = Guid.NewGuid(),
                FamilyId = family.Id,
                UserId = userId,
                IsOwner = true,
                IsParent = true,
                CreatedAt = DateTime.UtcNow,
            };
            _context.Families.Add(family);
            _context.FamilyMemberships.Add(membership);
            await _context.SaveChangesAsync();

            return Ok(ToResponseDto(family));
    }

    [HttpPost("{familyId}/invites")]
    public async Task<ActionResult<ResponseFamilyInviteDto>> PostInvite(Guid familyId)
    {
        var userId = this.GetUserId();

        if (this.GetUserRole() == RoleUser.Child)
        {
            return Forbid();
        }

        var canInvite = await _context.FamilyMemberships
            .AnyAsync(m => m.FamilyId == familyId && m.UserId == userId && (m.IsOwner || m.IsParent));
        if (!canInvite)
        {
            return Forbid();
        }

        var invite = new FamilyInvite
        {
            Id = Guid.NewGuid(),
            FamilyId = familyId,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
        };
        _context.FamilyInvites.Add(invite);
        await _context.SaveChangesAsync();

        return Ok(ToResponseInviteDto(invite));
    }

    [HttpPost("invites/{inviteId}/accept")]
    public async Task<IActionResult> AcceptInvite(Guid inviteId)
    {
        var userId = this.GetUserId();

        var invite = await _context.FamilyInvites.FirstOrDefaultAsync(i => i.Id == inviteId);

        if (invite == null || invite.RevokedAt != null || invite.ExpiresAt < DateTime.UtcNow)
        {
            return NotFound("Zaproszenie jest nieprawidłowe lub wygasło");
        }

        var alreadyMember = await _context.FamilyMemberships
            .AnyAsync(m => m.FamilyId == invite.FamilyId && m.UserId == userId);
        if (alreadyMember)
        {
            return Conflict("Jesteś już członkiem tej rodziny");
        }

        _context.FamilyMemberships.Add(new FamilyMembership
        {
            Id = Guid.NewGuid(),
            FamilyId = invite.FamilyId,
            UserId = userId,
            IsOwner = false,
            IsParent = false,
            CreatedAt = DateTime.UtcNow,
        });
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ResponseFamilyDetailsDto>>> GetFamilies()
    {
        var userId = this.GetUserId();
        
        var families = await _context.Families
            .Where(f => f.Memberships.Any(m => m.UserId == userId))
            .Include(f => f.Memberships)
            .ThenInclude(m => m.User)
            .ToListAsync();
        
        var result = families.Select(f =>
        {
            var caller = f.Memberships.First(m => m.UserId == userId);
            return new ResponseFamilyDetailsDto
            {
                Id = f.Id,
                CreatedAt = f.CreatedAt,
                IsOwner = caller.IsOwner,
                IsParent = caller.IsParent,
                Members = f.Memberships.Select(m => new FamilyMembershipDto
                {
                    UserId = m.UserId,
                    FirstName = m.User.FirstName,
                    LastName = m.User.LastName,
                    IsOwner = m.IsOwner,
                    IsParent = m.IsParent
                }).ToList()
            };
        }).ToList();
        return Ok(result);
    }

    [HttpDelete("{familyId}/leave")]
    public async Task<IActionResult> LeaveFamily(Guid familyId)
    {
        var userId = this.GetUserId();

        if (this.GetUserRole() == RoleUser.Child)
        {
            return Forbid();
        }

        var mebership = await _context.FamilyMemberships
            .FirstOrDefaultAsync(m => m.FamilyId == familyId && m.UserId == userId);

        if (mebership == null)
        {
            return NotFound("Nie jesteś członkiem tej rodziny");
        }

        if (mebership.IsOwner)
        {
            return BadRequest("Właściciel rodziny nie może opuścić bez wcześniejszego przekazanie roli innej osobie");
        }
        
        var hideRecord = await _context.ExaminationsHide
            .Where(h => h.HiddenForUserId == userId || h.HiddenByUserId == mebership.UserId)
            .ToListAsync();
        
        _context.ExaminationsHide.RemoveRange(hideRecord);
        _context.FamilyMemberships.Remove(mebership);
        await _context.SaveChangesAsync();
        
        return NoContent();
    }

    [HttpDelete("{familyId}")]
    public async Task<IActionResult> DeleteFamily(Guid familyId)
    {
        var userId = this.GetUserId();

        if (this.GetUserRole() == RoleUser.Child)
        {
            return Forbid();
        }

        var membership = await _context.FamilyMemberships
            .FirstOrDefaultAsync(m => m.FamilyId == familyId && m.UserId == userId);
        if (membership == null)
        {
            return NotFound("Nie znaleziono rodziny");
        }

        if (!membership.IsOwner)
        {
            return Forbid();
        }
        
        var memberUsersIds = await _context.FamilyMemberships
            .Where(m => m.FamilyId == familyId)
            .Select(m => m.UserId)
            .ToListAsync();
        
        var hideRecords = await _context.ExaminationsHide
            .Where(h => memberUsersIds.Contains(h.HiddenForUserId) || memberUsersIds.Contains(h.HiddenByUserId))
            .ToListAsync();
        
        _context.ExaminationsHide.RemoveRange(hideRecords);
        
        var family = await _context.Families.FirstOrDefaultAsync(f => f.Id == familyId);
        _context.Families.Remove(family);
        
        await _context.SaveChangesAsync();
        
        return NoContent();
        
    }
    
    [HttpPost("{familyId}/members/{userId}/grant-parent")]
    public async Task<IActionResult> GrantParent(Guid familyId, Guid userId)
    {
        var callerId = this.GetUserId();

        var callerMembership = await _context.FamilyMemberships
            .FirstOrDefaultAsync(m => m.FamilyId == familyId && m.UserId == callerId);
        if (callerMembership == null || !callerMembership.IsOwner)
        {
            return Forbid();
        }

        var targetMembership = await _context.FamilyMemberships
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.FamilyId == familyId && m.UserId == userId);
        if (targetMembership == null)
        {
            return NotFound("Ta osoba nie jest członkiem tej rodziny");
        }

        if (targetMembership.User.Role == RoleUser.Child)
        {
            return BadRequest("Rola Parent może zostać nadana tylko osobie dorosłej");
        }

        targetMembership.IsParent = true;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{familyId}/transfer-ownership")]
    public async Task<IActionResult> TransferOwnership(Guid familyId, TransferOwnershipDto dto)
    {
        var userId = this.GetUserId();

        var callerMembership = await _context.FamilyMemberships
            .FirstOrDefaultAsync(m => m.FamilyId == familyId && m.UserId == userId);
        if (callerMembership == null || !callerMembership.IsOwner)
        {
            return Forbid();
        }

        var otherParents = await _context.FamilyMemberships
            .Where(m => m.FamilyId == familyId && m.IsParent && m.UserId != userId)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();

        FamilyMembership newOwnerMembership;

        if (dto.NewOwnerId.HasValue)
        {
            newOwnerMembership = otherParents.FirstOrDefault(m => m.UserId == dto.NewOwnerId.Value);
            if (newOwnerMembership == null)
            {
                return BadRequest("Wskazana osoba nie jest rodzicem w tej rodzinie");
            }
        }
        else if (otherParents.Count == 0)
        {
            return BadRequest("Brak innego rodzica — najpierw nadaj komuś tę rolę");
        }
        else if (otherParents.Count == 1)
        {
            newOwnerMembership = otherParents[0];
        }
        else
        {
            return BadRequest("Jest więcej niż jeden rodzic wskaż konkretną osobę");
        }

        newOwnerMembership.IsOwner = true;
        callerMembership.IsOwner = false;

        if (dto.AlsoLeaveFamily)
        {
            var hideRecords = await _context.ExaminationsHide
                .Where(h => h.HiddenForUserId == userId || h.HiddenByUserId == userId)
                .ToListAsync();
            _context.ExaminationsHide.RemoveRange(hideRecords);

            _context.FamilyMemberships.Remove(callerMembership);
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    
    private static ResponseFamilyDto ToResponseDto(Family f) =>
        new() { Id = f.Id, CreatedAt = f.CreatedAt };

    private static ResponseFamilyInviteDto ToResponseInviteDto(FamilyInvite i) =>
        new() { Id = i.Id, FamilyId = i.FamilyId, ExpiresAt = i.ExpiresAt };
}