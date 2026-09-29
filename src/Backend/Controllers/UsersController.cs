using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs.User;
using Backend.Helpers;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAccessService _accessService;

    public UsersController(AppDbContext context, IAccessService accessService)
    {
        _context = context;
        _accessService = accessService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<ResponseUserDto>> GetMe()
    {
        var userId = this.GetUserId();
        var user = await _context.Users
            .Include(u => u.Account)
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(ToResponseDto(user));
    }

    [HttpPut("me")]
    public async Task<ActionResult<ResponseUserDto>> PutMe(UpdateUserDto dto)
    {
        var userId = this.GetUserId();
        var user = await _context.Users
            .Include(u => u.Account)
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return NotFound();
        }

        var birthDateError = CheckOwnBirthDateChange(user, dto.BirthDate);
        if (birthDateError != null)
        {
            return birthDateError;
        }

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.BirthDate = dto.BirthDate!.Value; // [Required] w UpdateUserDto gwarantuje wartość
        user.Gender = dto.Gender;
        user.Height = dto.Height;
        user.Weight = dto.Weight;
        user.BloodType = dto.BloodType;
        user.Avatar = dto.Avatar;

        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(user));
    }

    [HttpPatch("me")]
    public async Task<ActionResult<ResponseUserDto>> PatchMe(PatchUserDto dto)
    {
        var userId = this.GetUserId();
        var user = await _context.Users
            .Include(u => u.Account)
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return NotFound();
        }

        var birthDateError = CheckOwnBirthDateChange(user, dto.BirthDate);
        if (birthDateError != null)
        {
            return birthDateError;
        }

        if (dto.FirstName is not null) user.FirstName = dto.FirstName;
        if (dto.LastName is not null) user.LastName = dto.LastName;
        if (dto.BirthDate.HasValue) user.BirthDate = dto.BirthDate.Value;
        if (dto.Gender.HasValue) user.Gender = dto.Gender.Value;
        if (dto.Height.HasValue) user.Height = dto.Height.Value;
        if (dto.Weight.HasValue) user.Weight = dto.Weight.Value;
        if (dto.BloodType.HasValue) user.BloodType = dto.BloodType.Value;
        if (dto.Avatar is not null) user.Avatar = dto.Avatar;

        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(user));
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<ResponseUserDto>> PatchUser(Guid id, PatchUserDto dto)
    {
        var callerId = this.GetUserId();
        
        if (id == callerId)
        {
            return BadRequest();
        }
        
        var accesssToManage = await _accessService.CanManage(callerId, id);
        if (!accesssToManage)
        {
            return NotFound();
        }
        
        var user = await _context.Users
            .Include(u => u.Account)
            .FirstOrDefaultAsync(u => u.Id == id);
        
        if (user == null)
        {
            return NotFound();
        }
        
        if (dto.FirstName is not null) user.FirstName = dto.FirstName;
        if (dto.LastName is not null) user.LastName = dto.LastName;
        if (dto.BirthDate.HasValue) user.BirthDate = dto.BirthDate.Value;
        if (dto.Gender.HasValue) user.Gender = dto.Gender.Value;
        if (dto.Height.HasValue) user.Height = dto.Height.Value;
        if (dto.Weight.HasValue) user.Weight = dto.Weight.Value;
        if (dto.BloodType.HasValue) user.BloodType = dto.BloodType.Value;
        if (dto.Avatar is not null) user.Avatar = dto.Avatar;

        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(user));
    }
    
    private ActionResult? CheckOwnBirthDateChange(User user, DateOnly? newBirthDate)
    {
        if (newBirthDate == null || newBirthDate.Value == user.BirthDate)
        {
            return null;
        }

        if (IsChild(user.BirthDate))
        {
            return Forbid();
        }

        if (IsChild(newBirthDate.Value))
        {
            return BadRequest("Nie możesz ustawić na swoim profilu daty urodzenia osoby niepełnoletniej");
        }

        return null;
    }

    private static bool IsChild(DateOnly birthDate)
    {
        return AgeCategoryCalculator.Calculate(birthDate, PolandClock.Today()) == AgeCategory.Child;
    }

    private static ResponseUserDto ToResponseDto(User u)
    {
        return new ResponseUserDto
        {
            Id = u.Id,
            Email = u.Account?.Email,
            FirstName = u.FirstName,
            LastName = u.LastName,
            BirthDate = u.BirthDate,
            Gender = u.Gender,
            Height = u.Height,
            Weight = u.Weight,
            Role = u.Role,
            BloodType = u.BloodType,
            Avatar = u.Avatar,
        };
    }
}
