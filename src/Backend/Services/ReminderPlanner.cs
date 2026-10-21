using Backend.Data;
using Backend.DTOs.Reminder;
using Backend.Helpers;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class ReminderPlanner : IReminderPlanner
{
    private const int EarlyNoticeDaysBefore = 7;
    private static readonly TimeOnly EarlyNoticeTime = new(9, 0);
    private static readonly TimeSpan BeforeExam = TimeSpan.FromHours(2);
    private static readonly TimeOnly EarliestReminder = new(7, 0);
    private static readonly TimeOnly EveningBefore = new(18, 0);
    
    private readonly AppDbContext _context;

    public ReminderPlanner(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task<List<ReminderItemDto>> BuildAsync(Guid userId, DateTime from, DateTime until)
    {
        var items = new List<ReminderItemDto>();
        items.AddRange(await UpcomingExamsAsync(userId, from, until));
        
        return items
            .Where(i => i.FireAt > from && i.FireAt < until)
            .OrderBy(i => i.FireAt)
            .ToList();
    }
    
    private async Task<List<ReminderItemDto>> UpcomingExamsAsync(Guid userId, DateTime from, DateTime until)
    {
        var firstDate = DateOnly.FromDateTime(from);
        var lastDate = DateOnly.FromDateTime(until).AddDays(EarlyNoticeDaysBefore);

        var exams = await _context.Examinations
            .Where(e => e.UserId == userId
                        && e.Date >= firstDate 
                        && e.Date <= lastDate 
                        && e.Status != ExaminationsStatus.Completed 
                        && e.Status != ExaminationsStatus.Skipped)
            .ToListAsync();

        var items = new List<ReminderItemDto>();
        foreach (var exam in exams)
        {
            var reminderDate = exam.Date.AddDays(-EarlyNoticeDaysBefore);
            var reminderTime = reminderDate.ToDateTime(EarlyNoticeTime);

            var reminder = new ReminderItemDto
            {
                Key = $"exam:{exam.Id}:A:7d",
                Category = "exams",
                FireAt = reminderTime,
                Title = $"Badanie za {EarlyNoticeDaysBefore} dni",
                Body = Describe(exam)
            };

            items.Add(reminder);
            items.Add(ShortNotice(exam));
        }
        return items;
    }

    private static ReminderItemDto ShortNotice(Examination exam)
    {
        if (exam.Time != null)
        {
            var examStart = exam.Date.ToDateTime(exam.Time.Value);
            var fireAt = examStart - BeforeExam;

            if (fireAt.Date == examStart.Date && TimeOnly.FromDateTime(fireAt) >= EarliestReminder)
            {
                return new ReminderItemDto
                {
                    Key = $"exam:{exam.Id}:A:2h",
                    Category = "exams",
                    FireAt = fireAt,
                    Title = "Badanie za 2 godziny",
                    Body = Describe(exam)
                };
            }
        }

        return new ReminderItemDto
        {
            Key = $"exam:{exam.Id}:A:eve",
            Category = "exams",
            FireAt = exam.Date.AddDays(-1).ToDateTime(EveningBefore),
            Title = "Jutro badanie",
            Body = Describe(exam)
        };
    }

    private static string Describe(Examination exam)
    {
        return exam.Time != null ? $"{exam.Name}, godz. {exam.Time.Value:HH:mm}" : exam.Name;
    }
    
}