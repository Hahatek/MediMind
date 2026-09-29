using System.ComponentModel.DataAnnotations;
using Backend.Helpers;

namespace Backend.DTOs.MedicationSchedule;

// Pora wysyłana razem z nowym lekiem w CreateMedicationDto — bez MedicationId, bo lek dopiero powstaje.
public class NewMedicationScheduleDto
{
    [EnumDataType(typeof(MedicationTime))] public MedicationTime TimeOfDay { get; set; }
    public TimeOnly? Time { get; set; }
    [Range(0.01, 1000)] public decimal Amount { get; set; } = 1;
}
