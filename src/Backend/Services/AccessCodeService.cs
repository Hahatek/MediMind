using System.Security.Cryptography;
using System.Text;
using Backend.Data;
using Backend.Helpers;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Backend.Services;

public class AccessCodeService : IAccessCodeService
{
    private const int CodeValidMinutes = 10;
    private const int MaxGenerateAttempts = 5;

    private readonly AppDbContext _context;
    private readonly byte[] _secret;

    public AccessCodeService(AppDbContext context, AccessCodeOptions options)
    {
        _context = context;
        _secret = Encoding.UTF8.GetBytes(options.Secret);
    }

    public async Task<(ProfileAccessCode Entity, string Code)> GenerateAsync(Guid targetUserId, CodeActionType actionType, Guid createdByUserId)
    {
        for (var attempt = 0; attempt < MaxGenerateAttempts; attempt++)
        {
            var now = DateTime.UtcNow;
            var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");

            var entity = new ProfileAccessCode
            {
                Id = Guid.NewGuid(),
                TargetUserId = targetUserId,
                ActionType = actionType,
                CreatedByUserId = createdByUserId,
                CodeHash = Hash(actionType, code),
                CreatedAt = now,
                ExpiresAt = now.AddMinutes(CodeValidMinutes),
            };

            await using var transaction = await _context.Database.BeginTransactionAsync();
            
            await _context.Database.ExecuteSqlAsync(
                $"SELECT 1 FROM \"Users\" WHERE \"Id\" = {targetUserId} FOR UPDATE");
            
            await _context.ProfileAccessCodes
                .Where(c => c.ConsumedAt == null && c.RevokedAt == null
                            && ((c.TargetUserId == targetUserId && c.ActionType == actionType) || c.ExpiresAt <= now))
                .ExecuteUpdateAsync(s => s.SetProperty(c => c.RevokedAt, now));

            _context.ProfileAccessCodes.Add(entity);

            try
            {
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return (entity, code);
            }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
            {
                
                await transaction.RollbackAsync();
                _context.Entry(entity).State = EntityState.Detached;
            }
        }

        throw new InvalidOperationException("Nie udało się wygenerować kodu dostępu");
    }

    public async Task<ProfileAccessCode?> ConsumeAsync(CodeActionType actionType, string code)
    {
        var hash = Hash(actionType, code);
        var now = DateTime.UtcNow;
     
        var candidate = await _context.ProfileAccessCodes
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.CodeHash == hash
                                      && c.ConsumedAt == null
                                      && c.RevokedAt == null
                                      && c.ExpiresAt > now);
        if (candidate == null)
        {
            return null;
        }
        
        var changed = await _context.ProfileAccessCodes
            .Where(c => c.Id == candidate.Id && c.ConsumedAt == null && c.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(c => c.ConsumedAt, now));

        if (changed != 1)
        {
            return null;
        }

        candidate.ConsumedAt = now;
       
        return candidate;

    }


    public string Hash(CodeActionType actionType, string code)
    {
        var input = Encoding.UTF8.GetBytes($"{actionType}:{code}");
        return Convert.ToBase64String(HMACSHA256.HashData(_secret, input));
    }
}
