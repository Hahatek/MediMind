using Backend.Data;
using Backend.Helpers;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class AccessService : IAccessService
{
    private readonly AppDbContext _context;
    
    public AccessService(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task<bool> IsGuardian(Guid callerId, Guid targetUserId)
    {
        return await _context.Guardianships.AnyAsync(g => g.GuardianUserId == callerId && g.WardUserId == targetUserId);
    }

    public async Task<bool> IsPrimaryGuardian(Guid callerId, Guid targetUserId)
    {
        return await _context.Guardianships.AnyAsync(g => g.GuardianUserId == callerId && g.IsPrimary && g.WardUserId == targetUserId);

    }

    public async Task<bool> CanRead(Guid callerId, Guid targetUserId)
    {
        if(callerId == targetUserId)  {
            return true;
        }

        if (await IsGuardian(callerId, targetUserId))
        {
            return true;
        }

        return await _context.FamilyMemberships.AnyAsync(m =>
            m.UserId == callerId
            && _context.FamilyMemberships.Any(other =>
                other.FamilyId == m.FamilyId 
                && other.UserId == targetUserId)); 

    }

    public async Task<bool> CanManage(Guid callerId, Guid targetUserId)
    {
        if (await IsGuardian(callerId, targetUserId))
        {
            return true;
        }

        if (callerId != targetUserId)
        {
            return false;
        }

        var birthDate = await _context.Users
            .Where(u => u.Id == callerId)
            .Select(u => u.BirthDate)
            .FirstAsync();

        return AgeCategoryCalculator.Calculate(birthDate, PolandClock.Today()) != AgeCategory.Child;
    }

    public async Task<bool> CanRecordIntake(Guid callerId, Guid targetUserId)
    {
        if(callerId == targetUserId)  {
            return true;
        }

        if (await IsGuardian(callerId, targetUserId))
        {
            return true;
        }

        return false;
    }

    // Wszyscy, których dane caller może czytać — ta sama reguła co CanRead, ale dla list:
    // ja + członkowie moich rodzin + moi podopieczni.
    public async Task<List<Guid>> GetReadableUserIds(Guid callerId)
    {
        var myFamilyIds = _context.FamilyMemberships
            .Where(m => m.UserId == callerId)
            .Select(m => m.FamilyId);

        var familyMemberIds = await _context.FamilyMemberships
            .Where(m => myFamilyIds.Contains(m.FamilyId))
            .Select(m => m.UserId)
            .ToListAsync();

        var wardIds = await _context.Guardianships
            .Where(g => g.GuardianUserId == callerId)
            .Select(g => g.WardUserId)
            .ToListAsync();

        return familyMemberIds
            .Concat(wardIds)
            .Append(callerId)
            .Distinct()
            .ToList();
    }
}