using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Medication;

public class DiscontinueMedicationDto
{
    // Lokalna data z telefonu — od tego dnia lek nie jest już przyjmowany
    [Required] public DateOnly? Date { get; set; }
}
