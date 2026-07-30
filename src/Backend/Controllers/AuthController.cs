using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Helpers;
using Backend.DTOs.Auth;
using Backend.Models;

namespace Backend.Controllers;

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
    
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        if (dto.Password != dto.ConfirmPassword)
        {
            return BadRequest("Hasła nie są identyczne");
        }
        
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (existingUser != null)
        {
            return Conflict("Użytkownik z podanym adresem email już istnieje");
        }
        
        var role = CalculateAgeForRole(dto.BirthDate);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            BirthDate = dto.BirthDate,
            Role = role,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _tokenService.GenerateToken(user);

        return Ok(new AuthResponseDto { Token = token });   
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user?.PasswordHash is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            return Unauthorized("Nieprawidłowy email lub hasło");
        }
        var token = _tokenService.GenerateToken(user);

        return Ok(new AuthResponseDto { Token = token });   
    }
}