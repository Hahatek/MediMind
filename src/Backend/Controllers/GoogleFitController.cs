using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

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
    public IActionResult Connect(Guid userId)
    {
        var url = _googleFitService.GetAuthorizationUrl(userId);
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
            await _googleFitService.HandleOAuthCallbackAsync(code!, state!);
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
        var isConnected = await _googleFitService.IsConnectedAsync(userId);
        return Ok(new { isConnected });
    }

    [HttpPost("disconnect")]
    public async Task<IActionResult> Disconnect(Guid userId)
    {
        await _googleFitService.DisconnectAsync(userId);
        return Ok();
    }

    [HttpGet("steps")]
    public async Task<IActionResult> GetSteps(Guid userId, DateOnly date)
    {
        try
        {
            var steps = await _googleFitService.GetStepsForDateAsync(userId, date);
            return Ok(new { date, steps });
        }
        catch (InvalidOperationException e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpGet("heart-rate")]
    public async Task<IActionResult> GetHeartRate(Guid userId, DateOnly date)
    {
        try
        {
            var summary = await _googleFitService.GetHeartRateForDateAsync(userId, date);
            return Ok(new { date, summary.AverageBpm, summary.MaxBpm, summary.MinBpm });
        }
        catch (InvalidOperationException e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpGet("sleep")]
    public async Task<IActionResult> GetSleep(Guid userId, DateOnly date)
    {
        try
        {
            var sleep = await _googleFitService.GetSleepForDateAsync(userId, date);
            return Ok(new { date, totalMinutes = (int)sleep.TotalMinutes });
        }
        catch (InvalidOperationException e)
        {
            return BadRequest(e.Message);
        }
    }

}
