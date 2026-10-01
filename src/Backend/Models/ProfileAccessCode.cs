using Backend.Helpers;

namespace Backend.Models;

public class ProfileAccessCode
{
    public Guid Id { get; set; }
    public Guid TargetUserId { get; set; }
    public CodeActionType ActionType { get; set; }
    public Guid CreatedByUserId { get; set; }
    public string CodeHash { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? ConsumedAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public User TargetUser { get; set; }
    public User CreatedByUser { get; set; }
    
}