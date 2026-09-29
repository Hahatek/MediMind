using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Medication;

// PUT nadpisuje wszystkie pola — tylko tędy można wyczyścić Strength, Notes, StartDate albo EndDate (wysłać null).
// DiscontinuedOn nie jest tu edytowalne, ustawia je tylko POST /api/medication/{id}/discontinue.
public class UpdateMedicationDto
{
    [Required] [MaxLength(200)] public string Name { get; set; }
    [MaxLength(100)] public string? Strength { get; set; }
    [Required] [MaxLength(50)] public string Form { get; set; }
    [MaxLength(1000)] public string? Notes { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
}
