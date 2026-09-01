using Backend.Helpers;

namespace Backend.Models;

// Informuje nas o porze brania leku 

public class MedicationSchedule
{
    public Guid Id { get; set; }
    public Guid MedicationId { get; set; }
    public MedicationTime TimeOfDay { get; set; }
    public TimeOnly? Time { get; set; }
    public Medication Medication { get; set; }
    public string? GoogleEventId { get; set; } // służy do synchornizacji z kalendarzem google
    public GoogleSyncStatus SyncStatus { get; set; } = GoogleSyncStatus.NotSynced;
    public string? LastSyncError { get; set; }

}