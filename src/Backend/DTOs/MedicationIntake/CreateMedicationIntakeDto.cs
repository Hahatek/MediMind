using Backend.Helpers;

namespace Backend.DTOs.MedicationIntake;

public class CreateMedicationIntakeDto
{
    public Guid MedicationScheduleId { get; set; }
    public DateOnly? Date { get; set; }
    public IntakeStatus Status { get; set; }
}
