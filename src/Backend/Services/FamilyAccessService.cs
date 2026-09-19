using Backend.Data;
using Backend.Helpers;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class FamilyAccessService : IFamilyAccessService
{
    private readonly AppDbContext _context;
    public FamilyAccessService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Guid>> GetVisibleUserIdsAsync(Guid userId)
    {
        var familyIds = await _context.FamilyMemberships
            .Where(m => m.UserId == userId)
            .Select(m => m.FamilyId)
            .ToListAsync();

        var visibleUserIds = await _context.FamilyMemberships
            .Where(m => familyIds.Contains(m.FamilyId))
            .Select(m => m.UserId)
            .Distinct()
            .ToListAsync();

        if (!visibleUserIds.Contains(userId))
        {
            visibleUserIds.Add(userId);
        }
        
        return visibleUserIds;
    }

    public async Task<bool> IsParentOfChildAsync(Guid callerId, Guid childUserId)
    {
        var parentFamilyIds = await _context.FamilyMemberships
            .Where(m => m.UserId == callerId && m.IsParent )
            .Select(m => m.FamilyId)
            .ToListAsync();

        if (parentFamilyIds.Count == 0)
        {
            return false;
        }
        
        return await _context.FamilyMemberships.AnyAsync(m => parentFamilyIds.Contains(m.FamilyId) && m.UserId == childUserId && m.User.Role == RoleUser.Child);
    }
    
}