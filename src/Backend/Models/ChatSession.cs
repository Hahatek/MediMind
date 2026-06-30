namespace Backend.Models;

public class ChatSession
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Topic { get; set; }
}