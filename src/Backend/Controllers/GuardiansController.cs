using Backend.Data;
using Backend.DTOs.Guardianship;
using Backend.Helpers;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Backend.Controllers;

// Opiekunowie jednego podopiecznego: wardId w adresie to zawsze osoba, którą ktoś się opiekuje.
[Authorize]
[ApiController]
[Route("api/users/{wardId:guid}/guardians")]
public class GuardiansController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAccessService _accessService;

    public GuardiansController(AppDbContext context, IAccessService accessService)
    {
        _context = context;
        _accessService = accessService;
    }

    [HttpPost]
    public async Task<ActionResult<GuardianDto>> AddGuardian(Guid wardId, AddGuardianDto dto)
    {
        var callerId = this.GetUserId();
        var guardianUserId = dto.GuardianUserId!.Value;

        if (!await _accessService.IsPrimaryGuardian(callerId, wardId))
        {
            if (await _accessService.CanRead(callerId, wardId))
            {
                return Forbid();
            }

            return NotFound();
        }

        if (guardianUserId == wardId)
        {
            return BadRequest("Podopieczny nie może być własnym opiekunem");
        }
        
        var candidate = await _context.Users
            .Include(u => u.Account)
            .FirstOrDefaultAsync(u => u.Id == guardianUserId);
        
        if (candidate == null)
        {
            return NotFound("Nie znaleziono tej osoby w rodzinie podopiecznego");
        }
        
       if (!await _context.FamilyMemberships.AnyAsync(m =>
            m.UserId == guardianUserId
            && _context.FamilyMemberships.Any(other =>
                other.FamilyId == m.FamilyId 
                && other.UserId == wardId)))
       {
           return NotFound("Nie znaleziono tej osoby w rodzinie podopiecznego");
       }
       var category = AgeCategoryCalculator.Calculate(candidate.BirthDate, PolandClock.Today());
       if (category == AgeCategory.Child)
       {
           return BadRequest("Osoba niepełnoletnia nie może być opiekunem");
       }
           
       if (candidate.Account == null)
       {
           return BadRequest("Osoba bez konta nie może być opiekunem");
       }
       
       if (await _accessService.IsGuardian(guardianUserId, wardId))
       {
           return Conflict("Ta osoba jest już opiekunem");
       }

       var guardian = new Guardianship
       {
           Id = Guid.NewGuid(),
           GuardianUserId = guardianUserId,
           WardUserId =  wardId,
           IsPrimary = false,
           CreatedAt = DateTime.UtcNow,
       };

       _context.Guardianships.Add(guardian);

       // Dwa jednoczesne żądania mogą oba przejść sprawdzenie IsGuardian — wtedy drugie zatrzyma unikalny indeks pary.
       try
       {
           await _context.SaveChangesAsync();
       }
       catch (DbUpdateException ex) when (IsUniqueViolation(ex))
       {
           return Conflict("Ta osoba jest już opiekunem");
       }

       return Ok(new GuardianDto
       {
           UserId = candidate.Id,
           FirstName = candidate.FirstName,
           LastName = candidate.LastName,
           IsPrimary = guardian.IsPrimary,
       });

    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GuardianDto>>> GetGuardians(Guid wardId)
    {
        var callerId = this.GetUserId();

        if (!await _accessService.CanRead(callerId, wardId))
        {
            return NotFound();
        }

        var guardians = await _context.Guardianships
            .Where(g => g.WardUserId == wardId)
            .OrderByDescending(g => g.IsPrimary)
            .ThenBy(g => g.CreatedAt)
            .Select(g => new GuardianDto
            {
                UserId = g.GuardianUserId,
                FirstName = g.GuardianUser.FirstName,
                LastName = g.GuardianUser.LastName,
                IsPrimary = g.IsPrimary,
            })
            .ToListAsync();

        return Ok(guardians);
    }

    [HttpDelete("{guardianUserId:guid}")]
    public async Task<IActionResult> RemoveGuardian(Guid wardId, Guid guardianUserId)
    {
        var callerId = this.GetUserId();

        var accessError = await this.CheckIsPrimaryGuardianAsync(_accessService, callerId, wardId);
        if (accessError != null)
        {
            return accessError;
        }

        var guardianship = await _context.Guardianships
            .FirstOrDefaultAsync(g => g.GuardianUserId == guardianUserId && g.WardUserId == wardId);
        if (guardianship == null)
        {
            return NotFound("Ta osoba nie jest opiekunem");
        }

        // Podopieczny nie może zostać bez Primary: tę rolę można tylko przekazać (TransferPrimary).
        if (guardianship.IsPrimary)
        {
            return BadRequest("Nie można usunąć głównego opiekuna — najpierw przekaż tę rolę innej osobie");
        }

        _context.Guardianships.Remove(guardianship);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{guardianUserId:guid}/make-primary")]
    public async Task<IActionResult> TransferPrimary(Guid wardId, Guid guardianUserId)
    {
        var callerId = this.GetUserId();

        var accessError = await this.CheckIsPrimaryGuardianAsync(_accessService, callerId, wardId);
        if (accessError != null)
        {
            return accessError;
        }

        if (guardianUserId == callerId)
        {
            return BadRequest("Jesteś już głównym opiekunem");
        }

        var wardGuardianships = await _context.Guardianships
            .Where(g => g.WardUserId == wardId && (g.GuardianUserId == callerId || g.GuardianUserId == guardianUserId))
            .ToListAsync();

        var current = wardGuardianships.First(g => g.GuardianUserId == callerId);
        var target = wardGuardianships.FirstOrDefault(g => g.GuardianUserId == guardianUserId);
        if (target == null)
        {
            return NotFound("Ta osoba nie jest opiekunem — najpierw ją dodaj");
        }

        // Dwa zapisy w jednej transakcji: indeks "najwyżej jeden Primary" jest sprawdzany od razu,
        // więc najpierw zdejmujemy rolę ze starego, dopiero potem nadajemy nowemu. Stary zostaje zwykłym opiekunem.
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            current.IsPrimary = false;
            await _context.SaveChangesAsync();

            target.IsPrimary = true;
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            return Conflict("Główny opiekun został właśnie zmieniony — odśwież dane");
        }

        return NoContent();
    }

    private static bool IsUniqueViolation(DbUpdateException ex) =>
        ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation };
}
