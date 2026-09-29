namespace Backend.Models;

public class Guardianship
{
    public Guid Id { get; set; }
    public Guid GuardianUserId { get; set; }
    public Guid WardUserId { get; set; }
    public bool IsPrimary { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public User GuardianUser { get; set; }
    public User WardUser { get; set; }
}