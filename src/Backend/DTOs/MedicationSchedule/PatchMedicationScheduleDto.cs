using System.ComponentModel.DataAnnotations;
using Backend.Helpers;

namespace Backend.DTOs.MedicationSchedule;

// null = "nie zmieniaj". Wyczyszczenie Time robi się przez PUT.
public class PatchMedicationScheduleDto
{
    public MedicationTime? TimeOfDay { get; set; }
    public TimeOnly? Time { get; set; }
    [Range(0.01, 1000)] public decimal? Amount { get; set; }
}
