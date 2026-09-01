using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/googlecalendar")]
public class GoogleCalendarController : ControllerBase
{

    private readonly IGoogleCalendarService _googleCalendarService;

    public GoogleCalendarController(IGoogleCalendarService googleCalendarService)
    {
        _googleCalendarService = googleCalendarService;
    }
    
    [HttpGet("connect")]
    public IActionResult Connect(Guid userId)
    {
        var url = _googleCalendarService.GetAuthorizationUrl(userId);
        return Ok(new { url });
    }

    [HttpGet("callback")]
    public async Task<IActionResult> Callback(string? code, string? state, string? error)
    {
        if (!string.IsNullOrEmpty(error))
        {
            return BadRequest();
        }

        try
        {
            await _googleCalendarService.HandleOAuthCallbackAsync(code!, state!);
            return Ok();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
 
    [HttpGet("status")]
    public async Task<IActionResult> Status(Guid userId)
    {
        var isConnected = await _googleCalendarService.IsConnectedAsync(userId);
        return Ok(new { isConnected });
    }

    [HttpPost("disconnect")]
    public async Task<IActionResult> Disconnect(Guid userId)
    {
        await _googleCalendarService.DisconnectAsync(userId);
        return Ok();
    }

}