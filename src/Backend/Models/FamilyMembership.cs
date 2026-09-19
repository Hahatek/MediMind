namespace Backend.Models;

public class FamilyMembership
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    public Guid UserId { get; set; }
    public bool IsOwner { get; set; }
    public bool IsParent { get; set; }
    public DateTime CreatedAt { get; set; }

    public Family Family { get; set; }
    public User User { get; set; }
}