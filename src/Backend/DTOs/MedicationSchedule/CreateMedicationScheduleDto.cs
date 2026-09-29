using System.ComponentModel.DataAnnotations;
using Backend.Helpers;

namespace Backend.DTOs.MedicationSchedule;

public class CreateMedicationScheduleDto
{
    public Guid MedicationId { get; set; }
    public MedicationTime TimeOfDay { get; set; }
    public TimeOnly? Time { get; set; }
    [Range(0.01, 1000)] public decimal Amount { get; set; } = 1;
}
