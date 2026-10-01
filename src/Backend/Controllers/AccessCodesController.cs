using Backend.Data;
using Backend.DTOs.AccessCode;
using Backend.Helpers;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

// Generowanie kodów dostępu do profilu podopiecznego: userId w adresie to profil, którego kod dotyczy.
// Samo użycie kodu (telefon dziecka, konto seniora) to osobne, anonimowe endpointy.
[Authorize]
[ApiController]
[Route("api/users/{userId:guid}/access-codes")]
public class AccessCodesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAccessService _accessService;
    private readonly IAccessCodeService _accessCodeService;

    public AccessCodesController(AppDbContext context, IAccessService accessService, IAccessCodeService accessCodeService)
    {
        _context = context;
        _accessService = accessService;
        _accessCodeService = accessCodeService;
    }

    [HttpPost]
    public async Task<ActionResult<AccessCodeDto>> CreateAccessCode(Guid userId, CreateAccessCodeDto dto)
    {
        var callerId = this.GetUserId();
        var actionType = dto.ActionType!.Value;

        var accessError = await this.CheckIsPrimaryGuardianAsync(_accessService, callerId, userId);
        if (accessError != null)
        {
            return accessError;
        }

        var hasAccount = await _context.UserAccounts.AnyAsync(a => a.UserId == userId);
        if (hasAccount)
        {
            return BadRequest("Ten profil ma już konto");
        }
        
        if (actionType == CodeActionType.ClaimProfile)
        {
            var birthDate = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => u.BirthDate)
                .FirstAsync();

            var age = AgeCategoryCalculator.Calculate(birthDate, PolandClock.Today());

            if (age == AgeCategory.Child)
            {
                return BadRequest("Profil dziecka nie może mieć konta — użyj połączenia telefonu");
            }
        }
        
        var (entity, code) = await _accessCodeService.GenerateAsync(userId, actionType, callerId);
        
        return Ok(new AccessCodeDto
        {
            Code = code, 
            ActionType = entity.ActionType,
            ExpiresAt = entity.ExpiresAt,
        });

    }
}
