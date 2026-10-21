namespace Backend.Models;

public class UserDevice
{
    public Guid Id { get; set; }
    public DateTime? RevokedAt { get; set; }    
    public DateTime CreatedAt { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; }

    public DateTime? LocalUntil { get; set; }
    
    public string? TimeZone { get; set; }
    
    public DateTime? LastSyncAt { get; set; }
}