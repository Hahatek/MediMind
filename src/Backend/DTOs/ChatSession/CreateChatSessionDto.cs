namespace Backend.DTOs.ChatSession;

public class CreateChatSessionDto
{
    public Guid UserId { get; set; }
    public string Topic { get; set; }
}
