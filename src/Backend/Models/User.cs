using Backend.Helpers;

namespace Backend.Models;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; }
    public string? PasswordHash  { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public DateOnly? BirthDate { get; set; }
    public Gender? Gender { get; set; }
    public double? Height { get; set; }
    public double? Weight { get; set; }
    public RoleUser Role { get; set; }
    public BloodType? BloodType { get; set; }
    public string? Avatar { get; set; }
    public string? GoogleId { get; set; }
    
    public ICollection<Examination> Examinations { get; set; } = new List<Examination>();
    public ICollection<FamilyMember> OwnedRelations { get; set; } = new List<FamilyMember>();
    public ICollection<FamilyMember> MemberRelations { get; set; } = new List<FamilyMember>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<Medication> Medications { get; set; } = new List<Medication>();
    public ICollection<ChatSession> ChatSessions { get; set; } = new List<ChatSession>();
    public ICollection<ChangeRequest> CreatedChangeRequests  { get; set; } = new List<ChangeRequest>();
    public ICollection<ChangeRequest> ReviewedChangeRequests { get; set; } = new List<ChangeRequest>();
}