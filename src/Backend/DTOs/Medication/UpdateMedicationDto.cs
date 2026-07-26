namespace Backend.DTOs.Medication;

public class UpdateMedicationDto
{
    public string? Name { get; set; }
    public double Dose { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
}
