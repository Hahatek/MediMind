namespace Backend.Models;

public class Medication
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? Name { get; set; }
    public double Dose { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public ICollection<MedicationSchedule> MedicationSchedules { get; set; } = new List<MedicationSchedule>();
    public User User { get; set; }
}