using Backend.Models;

namespace Backend.Services;

public interface IFamilyInviteService
{
    Task<(FamilyInvite Entity, string Code)> GenerateAsync(Guid familyId, Guid createdByUserId);
    Task<FamilyInvite?> ConsumeAsync(string code, Guid consumedByUserId);
    string Hash(string code);
}
