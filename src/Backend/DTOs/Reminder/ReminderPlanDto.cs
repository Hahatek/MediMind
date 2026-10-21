namespace Backend.DTOs.Reminder;

public class ReminderPlanDto
{
    public List<ReminderItemDto> Items { get; set; } = new();
    public DateTime CoveredUntil { get; set; }
}