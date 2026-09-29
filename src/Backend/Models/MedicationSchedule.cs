using Backend.Helpers;

namespace Backend.Models;

// Informuje nas o porze brania leku i o tym, ile go przyjąć

public class MedicationSchedule
{
    public Guid Id { get; set; }
    public Guid MedicationId { get; set; }
    public MedicationTime TimeOfDay { get; set; }
    public TimeOnly? Time { get; set; }
    public decimal Amount { get; set; } = 1; // ile jednostek Medication.Form, np. 0.5 tabletki
    public Medication Medication { get; set; }
    public string? GoogleEventId { get; set; } // służy do synchornizacji z kalendarzem google
    public GoogleSyncStatus SyncStatus { get; set; } = GoogleSyncStatus.NotSynced;
    public string? LastSyncError { get; set; }

}