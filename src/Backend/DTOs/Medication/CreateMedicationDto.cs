using System.ComponentModel.DataAnnotations;
using Backend.DTOs.MedicationSchedule;

namespace Backend.DTOs.Medication;

public class CreateMedicationDto
{
    [Required] [MaxLength(200)] public string Name { get; set; }
    [MaxLength(100)] public string? Strength { get; set; }
    [Required] [MaxLength(50)] public string Form { get; set; }
    [MaxLength(1000)] public string? Notes { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public Guid? ForUserId { get; set; }

    // Pory zapisywane razem z lekiem w jednej transakcji. Brak/pusta lista = lek bez pór.
    public List<NewMedicationScheduleDto>? Schedules { get; set; }
}
