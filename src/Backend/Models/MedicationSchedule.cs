using Backend.Helpers;

namespace Backend.Models;

public class MedicationSchedule
{
    public Guid Id { get; set; }
    public Guid MedicationId { get; set; }
    public MedicationTime TimeOfDay { get; set; }
    public TimeOnly? Time { get; set; }
    public Medication Medication { get; set; }
}