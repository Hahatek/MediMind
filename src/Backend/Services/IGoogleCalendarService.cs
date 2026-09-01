using Backend.Models;

namespace Backend.Services;

public interface IGoogleCalendarService
{
    
    string GetAuthorizationUrl(Guid userId);
    
    Task HandleOAuthCallbackAsync(string code, string state);

    Task DisconnectAsync(Guid userId);

    // Badania
     
    Task<GoogleSyncResult> CreateEventAsyncExamination(Examination examination);

    Task<GoogleSyncResult> UpdateEventAsyncExamination(Examination examination);

    Task<GoogleSyncResult> DeleteEventAsyncExamination(Examination examination);
    
    Task<GoogleSyncResult> RetrySyncAsyncExamination(Examination examination);
    
    // Leki
    
    Task<GoogleSyncResult> CreateEventAsyncMedicationSchedule(MedicationSchedule schedule);
    
    Task<GoogleSyncResult> UpdateEventAsyncMedicationSchedule(MedicationSchedule schedule);
    
    Task<GoogleSyncResult> DeleteEventAsyncMedicationSchedule(MedicationSchedule schedule);
    
    Task<GoogleSyncResult> RetrySyncAsyncMedicationSchedule(MedicationSchedule schedule);
    
    Task<bool> IsConnectedAsync(Guid userId);
}


public record GoogleSyncResult(bool Success, string? ErrorMessage, string? EventIdIfCreated);