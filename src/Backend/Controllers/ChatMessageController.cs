using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs.ChatMessage;
using Backend.Models;

namespace Backend.Controllers;

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
        var messages = await _context.ChatMessages
            .Where(m => m.SessionId == sessionId)
            .OrderBy(m => m.Time)
            .ToListAsync();

        return Ok(messages.Select(ToResponseDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseChatMessageDto>> GetChatMessage(Guid id)
    {
        var chatMessage = await _context.ChatMessages.FindAsync(id);
        if (chatMessage == null)
        {
            return NotFound($"Nie znaleziono wiadomości o id {id}");
        }

        return Ok(ToResponseDto(chatMessage));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteChatMessage(Guid id)
    {
        var chatMessage = await _context.ChatMessages.FindAsync(id);
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