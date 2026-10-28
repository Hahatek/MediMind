using Backend.Data;
using Backend.DTOs.Reminder;
using Backend.Helpers;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class ReminderPlanner : IReminderPlanner
{
    private const int EarlyNoticeDaysBefore = 7;
    private static readonly TimeOnly MorningTime = new(9, 0);
    private static readonly TimeSpan BeforeExam = TimeSpan.FromHours(2);
    private static readonly TimeOnly EarliestReminder = new(7, 0);
    private static readonly TimeOnly EveningTime = new(18, 0);
    
    private static readonly TimeSpan ConfirmAfterExam = TimeSpan.FromHours(1);
    private static readonly int[] ConfirmRetryDays = { 1, 3, 7 };
    private const int ConfirmLookbackDays = 8;
    private const int BookingEveryDays = 14;
    
    private readonly AppDbContext _context;

    public ReminderPlanner(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task<List<ReminderItemDto>> BuildAsync(Guid userId, DateTime from, DateTime until)
    {
        
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        var canConfirm = AgeCategoryCalculator.Calculate(user.BirthDate, PolandClock.Today()) != AgeCategory.Child;
        
        var items = new List<ReminderItemDto>();

        foreach (var (subjectId, name) in await SubjectsAsync(userId))
        {
            var subjectItems = new List<ReminderItemDto>();
            subjectItems.AddRange(await ExamReminderAsync(subjectId, from, until, canConfirm));
            subjectItems.AddRange(await MedicationReminderAsync(subjectId, from, until));

            if (canConfirm)
            {
                subjectItems.AddRange(await BookingReminderAsync(subjectId, from, until));
            }

            if (name != null)
            {
                foreach (var item in subjectItems)
                {
                    item.Title = $"{name}: {item.Title}";
                }
            }
            
            items.AddRange(subjectItems);
            
        }        
        return items
            .Where(i => i.FireAt > from && i.FireAt < until)
            .OrderBy(i => i.FireAt)
            .ToList();
    }

    private async Task<List<(Guid UserId, string? Name)>> SubjectsAsync(Guid recipentId)
    {
        var today = PolandClock.Today();
        var now = DateTime.UtcNow;
        
        var wards = await _context.Guardianships
            .Where(g => g.GuardianUserId == recipentId)
            .Select(g => new
            {
                g.WardUserId,
                g.WardUser.FirstName,
                g.WardUser.BirthDate,
                HasActiveDevice = _context.UserDevices.Any(d =>
                    d.UserId == g.WardUserId
                    && d.RevokedAt == null
                    && _context.RefreshTokens.Any(t =>
                        t.DeviceId == d.Id && t.RevokedAt == null && t.ExpiresAt > now)),
            })
            .ToListAsync();
        
        var subjects = new List<(Guid UserId, string? Name)> {(recipentId, null)};

        foreach (var ward in wards)
        {
            var category = AgeCategoryCalculator.Calculate(ward.BirthDate, today);
            if (category == AgeCategory.Child || (category == AgeCategory.Senior && !ward.HasActiveDevice))
            {
                subjects.Add((ward.WardUserId, ward.FirstName));
            }
        }

        return subjects;
    }
    
    private async Task<List<ReminderItemDto>> ExamReminderAsync(Guid userId, DateTime from, DateTime until, bool canConfirm)
    {
        var firstDate = DateOnly.FromDateTime(from).AddDays(-ConfirmLookbackDays);
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
            items.Add(Item(exam, "A:7d",
                exam.Date.AddDays(-EarlyNoticeDaysBefore).ToDateTime(MorningTime),
                $"Badanie za {EarlyNoticeDaysBefore} dni", Describe(exam)));

            var twoHours = TwoHoursBefore(exam);
            if (twoHours != null)
            {
                items.Add(twoHours);
            }
            
            var hasPreparation = !string.IsNullOrEmpty(exam.Preparation);
            if (twoHours == null || hasPreparation)
            {
                var body = hasPreparation ? $"{Describe(exam)}. Przygotowanie: {exam.Preparation}" : Describe(exam);
                items.Add(Item(exam, "eve", exam.Date.AddDays(-1).ToDateTime(EveningTime), "Jutro badanie", body));
            }

            if (canConfirm)
            {
                items.AddRange(ConfirmNotices(exam));
            }
            
        }

        return items;
    }

    private async Task<List<ReminderItemDto>> MedicationReminderAsync(Guid userId, DateTime from, DateTime until)
    {
        var firstDay = DateOnly.FromDateTime(from);
        var lastDay = DateOnly.FromDateTime(until);
        
        var medications = await _context.Medications
            .Include(m => m.MedicationSchedules)
            .Where(m => m.UserId == userId)
            .ToListAsync();

        var recorded = (await _context.MedicationIntakes
                .Where(i => i.UserId == userId && i.Date >= firstDay && i.Date <= lastDay)
                .Select(i => new { i.MedicationScheduleId, i.Date })
                .ToListAsync())
            .Select(i => (i.MedicationScheduleId, i.Date))
            .ToHashSet();

        var items = new List<ReminderItemDto>();

        for (var day = firstDay; day <= lastDay; day = day.AddDays(1))
        {
            foreach (var medication in medications)
            {
                if (medication.GetStatusOn(day) != MedicationStatus.Active)
                {
                    continue;
                }

                foreach (var schedule in medication.MedicationSchedules)
                {
                    if (schedule.Time == null || recorded.Contains((schedule.Id, day)))
                    {
                        continue;
                    }
                    
                    items.Add(new ReminderItemDto()
                    {
                        Key = $"dose:{schedule.Id}:{day:yyyy-MM-dd}",
                        Category = "meds",
                        FireAt = day.ToDateTime(schedule.Time.Value),
                        Title = "Czas na lek",
                        Body = $"{medication.Name}, godz. {schedule.Time.Value:HH:mm}",
                    });
                }
                
            }
        }
        
        return items;
    }
    
    private static List<ReminderItemDto> ConfirmNotices(Examination exam)
    {
        var first = exam.Date.AddDays(1).ToDateTime(MorningTime);
        if (exam.Time != null)
        {
            var afterExam = exam.Date.ToDateTime(exam.Time.Value) + ConfirmAfterExam;
            if (afterExam.Date == exam.Date.ToDateTime(TimeOnly.MinValue) &&
                TimeOnly.FromDateTime(afterExam) >= EarliestReminder)
            {
                first = afterExam;
            }
        }

        const string title = "Czy badanie się odbyło?";
        var body = $"{Describe(exam)}. Potwierdź w aplikacji";
        
        var items = new List<ReminderItemDto>{Item(exam, "C:0", first, title, body)};
        foreach (var days in ConfirmRetryDays)
        {
            var retry = DateOnly.FromDateTime(first).AddDays(days).ToDateTime(MorningTime);
            items.Add(Item(exam, $"C:{days}d", retry, title, body));
        }

        return items;
    }

    private static ReminderItemDto Item(Examination exam, string kind, DateTime fireAt, string title, string body)
    {
        return new ReminderItemDto()
        {
            Key = $"exam:{exam.Id}:{kind}",
            Category = "exams",
            FireAt = fireAt,
            Title = title,
            Body = body,
        };
    }

    private static ReminderItemDto? TwoHoursBefore(Examination exam)
    {
        if (exam.Time == null)
        {
            return null;
        }
        
        var examStart = exam.Date.ToDateTime(exam.Time.Value);
        var fireAt = examStart - BeforeExam;

        if (fireAt.Date != examStart.Date || TimeOnly.FromDateTime(fireAt) < EarliestReminder)
        {
            return null;
        }
        
        return Item(exam, "A:2h", fireAt, "Badanie za 2 godziny", Describe(exam));
    }

    private async Task<List<ReminderItemDto>> BookingReminderAsync(Guid userId, DateTime from, DateTime untill)
    {
        var fromDay = DateOnly.FromDateTime(from);
        var untilDay = DateOnly.FromDateTime(untill);

        var exams = await _context.Examinations
            .Where(e => e.UserId == userId
                        && e.IsCyclic
                        && e.SeriesId != null
                        && e.Status != ExaminationsStatus.Skipped)
            .ToListAsync();
        
        var items = new List<ReminderItemDto>();

        foreach (var series in exams.GroupBy(e => e.SeriesId!.Value))
        {
            var anchor = series.OrderByDescending(e => e.Date).First();
            if (anchor.CycleInterval == null)
            {
                continue;
            }
            
            var dueYear = anchor.Date.AddMonths(anchor.CycleInterval.Value).Year;
            var yearEnd = new DateOnly(dueYear, 12, 31);

            for (var day = new DateOnly(dueYear, 1, 3);
                 day <= yearEnd && day <= untilDay;
                 day = day.AddDays(BookingEveryDays))
            {
                if (day < fromDay)
                {
                    continue;
                }
                items.Add(new ReminderItemDto()
                {
                    Key = $"series:{series.Key}:D:{day:yyyy-MM-dd}",
                    Category = "exams",
                    FireAt = day.ToDateTime(MorningTime),
                    Title = "Czas umówić badanie",
                    Body = $"{anchor.Name}, kolejny termin w {dueYear} r."
                });
            }
        }
        return items;
    }
    
    private static string Describe(Examination exam)
    {
        return exam.Time != null ? $"{exam.Name}, godz. {exam.Time.Value:HH:mm}" : exam.Name;
    }
    
}