using System.Security.Cryptography;
using System.Text;
using Backend.Data;
using Backend.Helpers;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Backend.Services;

// Zaproszenie do rodziny v2: jednorazowy 6-cyfrowy kod, ważny 10 minut. Osobny mechanizm niż ProfileAccessCode
// (inna tabela i inny prefiks w HMAC), ale ten sam sekret z sekcji AccessCodes.
public class FamilyInviteService : IFamilyInviteService
{
    private const int CodeValidMinutes = 10;
    private const int MaxGenerateAttempts = 5;

    private readonly AppDbContext _context;
    private readonly byte[] _secret;

    public FamilyInviteService(AppDbContext context, AccessCodeOptions options)
    {
        _context = context;
        _secret = Encoding.UTF8.GetBytes(options.Secret);
    }

    public async Task<(FamilyInvite Entity, string Code)> GenerateAsync(Guid familyId, Guid createdByUserId)
    {
        for (var attempt = 0; attempt < MaxGenerateAttempts; attempt++)
        {
            var now = DateTime.UtcNow;
            var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");

            var entity = new FamilyInvite
            {
                Id = Guid.NewGuid(),
                FamilyId = familyId,
                CreatedByUserId = createdByUserId,
                CodeHash = Hash(code),
                CreatedAt = now,
                ExpiresAt = now.AddMinutes(CodeValidMinutes),
            };

            await using var transaction = await _context.Database.BeginTransactionAsync();

            // Blokada wiersza rodziny: dwa równoległe generowania dla tej samej rodziny idą po kolei.
            await _context.Database.ExecuteSqlAsync(
                $"SELECT 1 FROM \"Families\" WHERE \"Id\" = {familyId} FOR UPDATE");

            // Nowe zaproszenie unieważnia poprzednie żywe tej rodziny; przy okazji sprzątamy wszystkie wygasłe.
            await _context.FamilyInvites
                .Where(i => i.ConsumedAt == null && i.RevokedAt == null
                            && (i.FamilyId == familyId || i.ExpiresAt <= now))
                .ExecuteUpdateAsync(s => s.SetProperty(i => i.RevokedAt, now));

            _context.FamilyInvites.Add(entity);

            try
            {
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return (entity, code);
            }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
            {
                // Wylosowany kod koliduje z innym żywym zaproszeniem — próbujemy jeszcze raz z nowym kodem.
                await transaction.RollbackAsync();
                _context.Entry(entity).State = EntityState.Detached;
            }
        }

        throw new InvalidOperationException("Nie udało się wygenerować zaproszenia");
    }

    public async Task<FamilyInvite?> ConsumeAsync(string code, Guid consumedByUserId)
    {
        var hash = Hash(code);
        var now = DateTime.UtcNow;
     
        
        var candidate = await _context.FamilyInvites
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.CodeHash == hash
                                      && c.ConsumedAt == null
                                      && c.RevokedAt == null
                                      && c.ExpiresAt > now);
        if (candidate == null)
        {
            return null;
        }
        
        var changed = await _context.FamilyInvites
            .Where(c => c.Id == candidate.Id && c.ConsumedAt == null && c.RevokedAt == null)
            .ExecuteUpdateAsync(s => 
                s.SetProperty(c => c.ConsumedAt, now)
                    .SetProperty(c => c.ConsumedByUserId, consumedByUserId));

        if (changed != 1)
        {
            return null;
        }

        candidate.ConsumedAt = now;
        candidate.ConsumedByUserId = consumedByUserId;
        
        return candidate;
    }

    public string Hash(string code)
    {
        var input = Encoding.UTF8.GetBytes($"FamilyInvite:{code}");
        return Convert.ToBase64String(HMACSHA256.HashData(_secret, input));
    }
}
