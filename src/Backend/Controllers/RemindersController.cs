using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Helpers;
using Backend.DTOs.Reminder;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/reminders")]
public class RemindersController : ControllerBase
{
    private static readonly TimeSpan PlanWindow = TimeSpan.FromDays(14);
    private const string DefaultTimeZone = "Europe/Warsaw";
    private const int MaxItems = 60;

    private readonly AppDbContext _context;
    private readonly IReminderPlanner _planner;

    public RemindersController(AppDbContext context, IReminderPlanner planner)
    {
        _context = context;
        _planner = planner;
    }

    [HttpGet("plan")]
    public async Task<ActionResult<ReminderPlanDto>> GetPlan([FromQuery] string? timeZone)
    {
        var device = await GetActiveDeviceAsync();
        if (device == null)
        {
            return Unauthorized("To urządzenie nie ma już dostępu");
        }

        if (!TimeZoneInfo.TryFindSystemTimeZoneById(timeZone ?? DefaultTimeZone, out var tz))
        {
            tz = TimeZoneInfo.FindSystemTimeZoneById(DefaultTimeZone);
        }

        var now = NowIn(tz);
        var until = now + PlanWindow;

        // Minuta zapasu: przypomnienie „na teraz” mogłoby minąć, zanim telefon je zaplanuje.
        var items = await _planner.BuildAsync(device.UserId, now.AddMinutes(1), until);

        // Po obcięciu lista jest kompletna tylko do pierwszej pozycji, która się nie zmieściła.
        var coveredUntil = until;
        if (items.Count > MaxItems)
        {
            coveredUntil = items[MaxItems].FireAt;
            items = items.Take(MaxItems).ToList();
        }

        return Ok(new ReminderPlanDto
        {
            Items = items,
            CoveredUntil = coveredUntil,
        });
    }

    [HttpPost("sync")]
    public async Task<IActionResult> Sync(ReminderSyncDto dto)
    {
        var device = await GetActiveDeviceAsync();

        if (device == null)
        {
            return Unauthorized("To urządzenie nie ma już dostępu");
        }

        if (!TimeZoneInfo.TryFindSystemTimeZoneById(dto.TimeZone, out var tz))
        {
            return BadRequest("Nieznana strefa czasowa");
        }

        DateTime? localUntil = null;
        if (dto.LocalUntil != null)
        {
            // Kolumna jest bez strefy, a Npgsql odrzuca DateTime oznaczony jako UTC.
            var value = DateTime.SpecifyKind(dto.LocalUntil.Value, DateTimeKind.Unspecified);
            var max = NowIn(tz) + PlanWindow;
            localUntil = value > max ? max : value;
        }
        
        device.LocalUntil = localUntil;
        device.TimeZone = dto.TimeZone;
        device.LastSyncAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<UserDevice?> GetActiveDeviceAsync()
    {
        var userId = this.GetUserId();
        var deviceId = this.GetDeviceId();

        return await _context.UserDevices.FirstOrDefaultAsync(d => d.Id == deviceId && d.UserId == userId && d.RevokedAt == null);
    }

    private static DateTime NowIn(TimeZoneInfo tz)
    {
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);
    }
}