using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Backend.Data;
using Backend.Helpers;
using Backend.DTOs.Auth;
using Backend.Models;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;
    
    public AuthController(AppDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService =  tokenService;
    }

    private static RoleUser CalculateAgeForRole(DateOnly birthDate)
    {
        var dateNow = int.Parse(DateTime.UtcNow.ToString("yyyyMMdd"));
        var brithDate =  int.Parse(birthDate.ToString("yyyyMMdd"));
        var age = (dateNow - brithDate) / 10000;

        if (age < 18)
        {
            return RoleUser.Child;
        }

        if (age < 60)
        {
            return RoleUser.Adult;
        }

        return RoleUser.Senior;    }
    
    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        var email = NormalizeEmail(dto.Email);

        var emailTaken = await _context.UserAccounts.AnyAsync(a => a.Email == email);
        if (emailTaken)
        {
            return Conflict("Użytkownik z podanym adresem email już istnieje");
        }

        var role = CalculateAgeForRole(dto.BirthDate);

        // User = osoba, UserAccount = dane logowania. User.Email zapisujemy jeszcze tylko
        // dlatego, że kolumna legacy jest wymagana (do etapu 4). User.PasswordHash już nie.
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            BirthDate = dto.BirthDate,
            Role = role,
        };

        var account = new UserAccount
        {
            UserId = user.Id,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            CreatedAt = DateTime.UtcNow,
        };

        _context.Users.Add(user);
        _context.UserAccounts.Add(account);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException 
                                           {
                                               SqlState: PostgresErrorCodes.UniqueViolation,
                                               ConstraintName: "IX_UserAccounts_Email" or "IX_Users_Email"
                                           })
        {
            return Conflict("Użytkownik z podanym adresem email już istnieje");
        }

        var token = _tokenService.GenerateToken(user);
        var (_, rawRefreshToken) = await _tokenService.GenerateRefreshTokenAsync(user.Id);

        return Ok(new AuthResponseDto { Token = token, RefreshToken = rawRefreshToken});
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var email = NormalizeEmail(dto.Email);

        // Dane logowania czytamy wyłącznie z UserAccount (legacy User.Email/PasswordHash są ignorowane)
        var account = await _context.UserAccounts
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Email == email);

        if (account == null || !BCrypt.Net.BCrypt.Verify(dto.Password, account.PasswordHash))
        {
            return Unauthorized("Nieprawidłowy email lub hasło");
        }

        var user = account.User;

        var token = _tokenService.GenerateToken(user);
        var (_, rawRefreshToken) = await _tokenService.GenerateRefreshTokenAsync(user.Id);

        return Ok(new AuthResponseDto { Token = token, RefreshToken = rawRefreshToken });
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponseDto>> Refresh(RefreshTokenDto dto)
    {
        var tokenHash = _tokenService.HashRefreshToken(dto.RefreshToken);

        var existingToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);

        if (existingToken == null || existingToken.RevokedAt != null || existingToken.ExpiresAt < DateTime.UtcNow)
        {
            return Unauthorized("Nieprawidłowy token");
        }

        // Refresh celowo NIE wymaga UserAccount — sesja z UserDevice (np. dziecko) też musi się odświeżać
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == existingToken.UserId);

        if (user == null)
        {
            return Unauthorized("Nieprawidłowy token");
        }

        existingToken.RevokedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var token = _tokenService.GenerateToken(user);
        var (_, rawRefreshToken) = await _tokenService.GenerateRefreshTokenAsync(user.Id);

        return Ok(new AuthResponseDto { Token = token, RefreshToken = rawRefreshToken });
    }

    [AllowAnonymous]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(RefreshTokenDto dto)
    {
        var tokenHash = _tokenService.HashRefreshToken(dto.RefreshToken);

        var existingToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);

        if (existingToken == null || existingToken.RevokedAt != null || existingToken.ExpiresAt < DateTime.UtcNow)
        {
            return Unauthorized("Nieprawidłowy token");
        }

        existingToken.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }
    
}