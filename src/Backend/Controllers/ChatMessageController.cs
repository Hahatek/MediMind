using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs.ChatMessage;
using Backend.Helpers;
using Backend.Models;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChatMessageController : ControllerBase
{

    private readonly AppDbContext _context;
    public ChatMessageController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpPost] 
    public async Task<ActionResult<ResponseChatMessageDto>> PostChatMessage(CreateChatMessageDto dto)
    {
        var userId = this.GetUserId();
        
        var sessionBelongToUser = await _context.ChatSessions
            .AnyAsync(s => s.Id == dto.SessionId && s.UserId == userId);

        if (!sessionBelongToUser)
        {
            return NotFound($"Nie znaleziono sesji rozmowy o id {dto.SessionId}");
        }
        
        var chatMessage = new ChatMessage()
        {
            Id = Guid.NewGuid(),
            SessionId = dto.SessionId,
            Content = dto.Content,
            Time = DateTime.UtcNow,
            Author = dto.Author,
        };
        _context.ChatMessages.Add(chatMessage);
        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(chatMessage));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ResponseChatMessageDto>>> GetChatMessages([FromQuery] Guid sessionId)
    {
        var userId = this.GetUserId();
        
        var sessionBelongToUser = await _context.ChatSessions
            .AnyAsync(s => s.Id == sessionId && s.UserId == userId);

        if (!sessionBelongToUser)
        {
            return NotFound($"Nie znaleziono sesji rozmowy o id {sessionId}");
        }
        
        var messages = await _context.ChatMessages
            .Where(m => m.SessionId == sessionId)
            .OrderBy(m => m.Time)
            .ToListAsync();

        return Ok(messages.Select(ToResponseDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseChatMessageDto>> GetChatMessage(Guid id)
    {
        var userId = this.GetUserId();
        var chatMessage = await _context.ChatMessages
            .Include(m => m.Session)
            .FirstOrDefaultAsync(m => m.Id == id && m.Session.UserId == userId);
        if (chatMessage == null)
        {
            return NotFound($"Nie znaleziono wiadomości o id {id}");
        }

        return Ok(ToResponseDto(chatMessage));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteChatMessage(Guid id)
    {
        var chatMessage = await _context.ChatMessages
            .Include(m => m.Session)
            .FirstOrDefaultAsync(m => m.Id == id && m.Session.UserId == this.GetUserId());
        if (chatMessage == null)
        {
            return NotFound($"Nie znaleziono wiadomości o id {id}");
        }

        _context.ChatMessages.Remove(chatMessage);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static ResponseChatMessageDto ToResponseDto(ChatMessage cm)
    {
        return new ResponseChatMessageDto
        {
            Id = cm.Id,
            SessionId = cm.SessionId,
            Content = cm.Content,
            Time = cm.Time,
            Author = cm.Author,
        };
    }
    
}