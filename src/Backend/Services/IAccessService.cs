namespace Backend.Services;

public interface IAccessService
{
    Task<bool> IsGuardian(Guid callerId, Guid targetUserId);
    Task<bool> IsPrimaryGuardian(Guid callerId, Guid targetUserId);
    Task<bool> CanRead(Guid callerId, Guid targetUserId);
    Task<bool> CanManage(Guid callerId, Guid targetUserId);
    Task<bool> CanRecordIntake(Guid callerId, Guid targetUserId);
    Task<List<Guid>> GetReadableUserIds(Guid callerId);
    
}