using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Reminder;

public class ReminderSyncDto
{
    public DateTime? LocalUntil { get; set; }
    
    [Required, MaxLength(64)]
    public string TimeZone { get; set; } = "";
}