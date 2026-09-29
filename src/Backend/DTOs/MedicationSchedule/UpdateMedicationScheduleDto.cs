using System.ComponentModel.DataAnnotations;
using Backend.Helpers;

namespace Backend.DTOs.MedicationSchedule;

// Bez MedicationId — pora zawsze należy do leku, dla którego ją utworzono.
// PUT nadpisuje wszystkie pola, więc tędy można wyczyścić Time (wysłać null).
public class UpdateMedicationScheduleDto
{
    public MedicationTime TimeOfDay { get; set; }
    public TimeOnly? Time { get; set; }
    [Range(0.01, 1000)] public decimal Amount { get; set; }
}
