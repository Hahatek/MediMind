namespace Backend.DTOs.ChatSession;

public class ResponseChatSessionDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Topic { get; set; }
}
