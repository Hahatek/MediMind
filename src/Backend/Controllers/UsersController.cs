using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.DTOs.User;
using Backend.Helpers;
using Backend.Models;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("me")]
    public async Task<ActionResult<ResponseUserDto>> GetMe()
    {
        var user = await _context.Users.FindAsync(this.GetUserId());
        if (user == null)
        {
            return NotFound();
        }

        return Ok(ToResponseDto(user));
    }

    [HttpPut("me")]
    public async Task<ActionResult<ResponseUserDto>> PutMe(UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(this.GetUserId());
        if (user == null)
        {
            return NotFound();
        }

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.BirthDate = dto.BirthDate;
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
        var user = await _context.Users.FindAsync(this.GetUserId());
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

    private static ResponseUserDto ToResponseDto(User u)
    {
        return new ResponseUserDto
        {
            Id = u.Id,
            Email = u.Email,
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
