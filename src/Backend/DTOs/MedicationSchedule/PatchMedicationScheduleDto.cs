using Backend.Helpers;

namespace Backend.DTOs.MedicationSchedule;

public class PatchMedicationScheduleDto
{
    public Guid? MedicationId { get; set; }
    public MedicationTime? TimeOfDay { get; set; }
    public TimeOnly? Time { get; set; }
}