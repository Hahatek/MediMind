using Backend.Helpers;
using Backend.Models;

namespace Backend.Services;

public interface IAccessCodeService
{
    Task<(ProfileAccessCode Entity, string Code)> GenerateAsync(Guid targetUserId, CodeActionType actionType, Guid createdByUserId);
    Task<ProfileAccessCode?> ConsumeAsync(CodeActionType actionType, string code);
    string Hash(CodeActionType actionType, string code);
}
