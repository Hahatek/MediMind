using Backend.Helpers;

namespace Backend.DTOs.MedicationIntake;

public class ResponseMedicationIntakeDto
{
    public Guid Id { get; set; }
    public Guid MedicationScheduleId { get; set; }
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }
    public IntakeStatus Status { get; set; }
    public DateTime RecordedAt { get; set; }
}
