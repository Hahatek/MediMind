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

    // IsParentOfChildAsync usunięte (etap 4, Family MVP v1): uprawnienia medyczne dają Guardianship + AccessService,
    // a IsParent zostaje wyłącznie do administracji rodziną (zaproszenia, TransferOwnership).
}