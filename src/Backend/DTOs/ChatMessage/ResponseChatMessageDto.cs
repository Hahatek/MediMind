using Backend.Helpers;

namespace Backend.DTOs.ChatMessage;

public class ResponseChatMessageDto
{
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public string Content { get; set; }
    public DateTime Time { get; set; }
    public AuthorChat Author { get; set; }
}
