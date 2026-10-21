using Backend.DTOs.Reminder;

namespace Backend.Services;

public interface IReminderPlanner
{
    Task<List<ReminderItemDto>> BuildAsync(Guid userId, DateTime from, DateTime until);
}