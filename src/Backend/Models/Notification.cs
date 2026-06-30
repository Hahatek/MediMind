using Backend.Helpers;

namespace Backend.Models;

public class Notification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? ExaminationId { get; set; }
    public NotificationType Type { get; set; }
    public string Content { get; set; }
    public DateTime ScheduledAt { get; set; }
    public DateTime? SentAt { get; set; }
    public bool IsRead { get; set; } 
}