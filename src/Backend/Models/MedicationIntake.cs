using Backend.Helpers;

namespace Backend.Models;

public class MedicationIntake
{
    public Guid Id { get; set; }
    public Guid MedicationScheduleId { get; set; }
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }
    public IntakeStatus Status { get; set; }
    public DateTime RecordedAt { get; set; }


    public TimeOnly? ScheduledTime { get; set; }

    public decimal ScheduledAmount { get; set; }

    public MedicationSchedule MedicationSchedule { get; set; }
    public User User { get; set; }
    public Guid? RecordedByUserId { get; set; }
}
