using Backend.Helpers;

namespace Backend.DTOs.MedicationSchedule;

public class ResponseMedicationScheduleDto
{
    public Guid Id { get; set; }
    public Guid MedicationId { get; set; }
    public MedicationTime TimeOfDay { get; set; }
    public TimeOnly? Time { get; set; }
}