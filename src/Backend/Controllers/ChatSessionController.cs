using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs.ChatSession;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatSessionController : ControllerBase
{
    private readonly AppDbContext _context;
    public ChatSessionController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpPost]
    public async Task<ActionResult<ResponseChatSessionDto>> PostChatSession(CreateChatSessionDto dto)
    {
        var chatSession = new ChatSession()
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            Topic = dto.Topic,
            CreatedAt = DateTime.UtcNow,
        };
        _context.ChatSessions.Add(chatSession);
        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(chatSession));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ResponseChatSessionDto>>> GetChatSessions()
    {
        var chatSessions = await _context.ChatSessions.ToListAsync();

        return Ok(chatSessions.Select(ToResponseDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseChatSessionDto>> GetChatSession(Guid id)
    {
        var chatSession = await _context.ChatSessions.FindAsync(id);
        if (chatSession == null)
        {
            return NotFound($"Nie znaleziono sesji czatu o id {id}");
        }

        return Ok(ToResponseDto(chatSession));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ResponseChatSessionDto>> PutChatSession(Guid id, UpdateChatSessionDto dto)
    {
        var chatSession = await _context.ChatSessions.FindAsync(id);
        if (chatSession == null)
        {
            return NotFound($"Nie znaleziono sesji czatu o id {id}");
        }

        chatSession.Topic = dto.Topic;

        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(chatSession));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteChatSession(Guid id)
    {
        var chatSession = await _context.ChatSessions.FindAsync(id);
        if (chatSession == null)
        {
            return NotFound($"Nie znaleziono sesji czatu o id {id}");
        }

        _context.ChatSessions.Remove(chatSession);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static ResponseChatSessionDto ToResponseDto(ChatSession cs)
    {
        return new ResponseChatSessionDto
        {
            Id = cs.Id,
            UserId = cs.UserId,
            CreatedAt = cs.CreatedAt,
            Topic = cs.Topic,
        };
    }

}