namespace Backend.Services;

public interface IFamilyAccessService
{
    Task<List<Guid>> GetVisibleUserIdsAsync(Guid userId);
    Task<bool> IsParentOfChildAsync(Guid callerId, Guid childUserId);
    
}