using Backend.Helpers;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/googlefit")]
public class GoogleFitController : ControllerBase
{

    private readonly IGoogleFitService _googleFitService;

    public GoogleFitController(IGoogleFitService googleFitService)
    {
        _googleFitService = googleFitService;
    }

    [HttpGet("connect")]
    public IActionResult Connect()
    {
        var url = _googleFitService.GetAuthorizationUrl(this.GetUserId());
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
            await _googleFitService.HandleOAuthCallbackAsync(code!, state!);
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
        var isConnected = await _googleFitService.IsConnectedAsync(this.GetUserId());
        return Ok(new { isConnected });
    }

    [HttpPost("disconnect")]
    public async Task<IActionResult> Disconnect()
    {
        await _googleFitService.DisconnectAsync(this.GetUserId());
        return Ok();
    }

    [HttpGet("steps")]
    public async Task<IActionResult> GetSteps(DateOnly date)
    {
        try
        {
            var steps = await _googleFitService.GetStepsForDateAsync(this.GetUserId(), date);
            return Ok(new { date, steps });
        }
        catch (InvalidOperationException e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpGet("heart-rate")]
    public async Task<IActionResult> GetHeartRate(DateOnly date)
    {
        try
        {
            var summary = await _googleFitService.GetHeartRateForDateAsync(this.GetUserId(), date);
            return Ok(new { date, summary.AverageBpm, summary.MaxBpm, summary.MinBpm });
        }
        catch (InvalidOperationException e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpGet("sleep")]
    public async Task<IActionResult> GetSleep(DateOnly date)
    {
        try
        {
            var sleep = await _googleFitService.GetSleepForDateAsync(this.GetUserId(), date);
            return Ok(new { date, totalMinutes = (int)sleep.TotalMinutes });
        }
        catch (InvalidOperationException e)
        {
            return BadRequest(e.Message);
        }
    }

}
