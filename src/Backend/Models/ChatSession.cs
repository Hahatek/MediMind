namespace Backend.Models;

public class ChatSession
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Topic { get; set; }
    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    public User Owner { get; set; }
}