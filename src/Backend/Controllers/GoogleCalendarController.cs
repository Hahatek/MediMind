using Backend.Helpers;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Authorize]
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
    public IActionResult Connect()
    {
        var url = _googleCalendarService.GetAuthorizationUrl(this.GetUserId());
        return Ok(new { url });
    }

    [AllowAnonymous]
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
    public async Task<IActionResult> Status()
    {
        var isConnected = await _googleCalendarService.IsConnectedAsync(this.GetUserId());
        return Ok(new { isConnected });
    }

    [HttpPost("disconnect")]
    public async Task<IActionResult> Disconnect()
    {
        await _googleCalendarService.DisconnectAsync(this.GetUserId());
        return Ok();
    }

}