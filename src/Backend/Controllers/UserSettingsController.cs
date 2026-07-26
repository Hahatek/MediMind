using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs.UserSetting;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserSettingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserSettingsController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpPost]
    public async Task<ActionResult<UserSettingsResponseDto>> PostUserSetting(CreateUserSettingsDto dto)
    {
        var userSetting = new UserSettings()
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            DarkMode = dto.DarkMode,
            FontSize = dto.FontSize,
        };
        _context.UserSettings.Add(userSetting);
        await _context.SaveChangesAsync();
        
        return Ok(ToResponseDto(userSetting));
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserSettingsResponseDto>>> GetUserSettings()
    {
        var userSetting = await _context.UserSettings.ToListAsync();

        return Ok(userSetting.Select(ToResponseDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserSettingsResponseDto>> GetUserSetting(Guid id)
    {
        var userSetting = await _context.UserSettings.FindAsync(id);
        if (userSetting == null)
        {
            return NotFound($"Nie znaleziono ustawienia o id {id}");
        }
        
        return Ok(ToResponseDto(userSetting));
    }
    
    [HttpPut("{id}")]
    public async Task<ActionResult<UserSettingsResponseDto>> PutUserSetting(Guid id, UpdateUserSettingsDto dto)
    {
        var userSetting = await _context.UserSettings.FindAsync(id);
        if (userSetting == null)
        {
            return NotFound($"Nie znaleziono ustawienia o id {id}");
        }

        userSetting.DarkMode = dto.DarkMode;
        userSetting.FontSize = dto.FontSize;
  
        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(userSetting));
    }
    
    [HttpPatch("{id}")]
    public async Task<ActionResult<UserSettingsResponseDto>> PatchUserSetting(Guid id, PatchUserSettingsDto dto)
    {
        var userSetting = await _context.UserSettings.FindAsync(id);
        if (userSetting == null)
        {
            return NotFound($"Nie znaleziono ustawienia o id {id}");
        }

        if (dto.DarkMode.HasValue) userSetting.DarkMode = dto.DarkMode.Value;
        if (dto.FontSize.HasValue) userSetting.FontSize = dto.FontSize.Value;

        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(userSetting));
    }

    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUserSetting(Guid id)
    {
        var userSetting = await _context.UserSettings.FindAsync(id);
        if (userSetting == null)
        {
            return NotFound($"Nie znaleziono ustawienia o id {id}");
        }

        _context.UserSettings.Remove(userSetting);
        await _context.SaveChangesAsync();

        return NoContent();
    }
    
    private static UserSettingsResponseDto ToResponseDto(UserSettings us)
    {
        return new UserSettingsResponseDto()
        {
            Id = us.Id,
            UserId = us.UserId,
            DarkMode = us.DarkMode,
            FontSize = us.FontSize,
        };
    }

}