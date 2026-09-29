using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Medication;

// PATCH tylko ustawia wartości: null = "nie zmieniaj". Wyczyszczenie pola (np. EndDate) robi się przez PUT.
public class PatchMedicationDto
{
    [MaxLength(200)] public string? Name { get; set; }
    [MaxLength(100)] public string? Strength { get; set; }
    [MaxLength(50)] public string? Form { get; set; }
    [MaxLength(1000)] public string? Notes { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
}
