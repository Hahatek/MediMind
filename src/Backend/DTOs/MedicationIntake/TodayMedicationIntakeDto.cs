using Backend.Helpers;

namespace Backend.DTOs.MedicationIntake;

public class TodayMedicationIntakeDto
{
    public Guid MedicationScheduleId { get; set; }
    public Guid MedicationId { get; set; }
    public string? MedicationName { get; set; }
    public MedicationTime TimeOfDay { get; set; }
    public TimeOnly? Time { get; set; }
    public TodayIntakeStatus Status { get; set; }
    public Guid? IntakeId { get; set; }
}
