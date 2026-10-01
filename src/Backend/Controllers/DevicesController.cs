using Backend.Data;
using Backend.DTOs.User;
using Backend.Helpers;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

// Urządzenia jednego profilu: userId w adresie to osoba, do której profilu urządzenie ma dostęp.
// Urządzeniami zarządza ten, kto zarządza profilem (CanManage): dorosły swoimi, opiekun podopiecznego.
[Authorize]
[ApiController]
[Route("api/users/{userId:guid}/devices")]
public class DevicesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAccessService _accessService;

    public DevicesController(AppDbContext context, IAccessService accessService)
    {
        _context = context;
        _accessService = accessService;
    }

    // Tylko aktywne urządzenia — odwołanych nie da się już odwołać, więc lista ich nie pokazuje.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDeviceDto>>> GetDevices(Guid userId)
    {
        var callerId = this.GetUserId();

        var accessError = await this.CheckCanManageAsync(_accessService, callerId, userId, "Nie znaleziono profilu");
        if (accessError != null)
        {
            return accessError;
        }

        var devices = await _context.UserDevices
            .Where(d => d.UserId == userId && d.RevokedAt == null)
            .OrderBy(d => d.CreatedAt)
            .Select(d => new UserDeviceDto { Id = d.Id, CreatedAt = d.CreatedAt })
            .ToListAsync();

        return Ok(devices);
    }

    [HttpDelete("{deviceId:guid}")]
    public async Task<IActionResult> RevokeDevice(Guid userId, Guid deviceId)
    {
        var callerId = this.GetUserId();

        var accessError = await this.CheckCanManageAsync(_accessService, callerId, userId, "Nie znaleziono profilu");
        if (accessError != null)
        {
            return accessError;
        }
        
        var device = await _context.UserDevices
            .FirstOrDefaultAsync(d => d.Id == deviceId && d.UserId == userId);

        if (device == null)
        {
            return NotFound(); 
        }

        if (device.RevokedAt != null)
        {
            return NoContent();
        }
        
        device.RevokedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
