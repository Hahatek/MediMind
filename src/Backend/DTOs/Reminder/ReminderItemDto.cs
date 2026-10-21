namespace Backend.DTOs.Reminder;

public class ReminderItemDto
{
    public required string Key { get; set; }
    public required string Category { get; set; }
    public DateTime FireAt { get; set; }
    public required string Title { get; set; }
    public required string Body { get; set; }
}