namespace Backend.Models;

public class Family
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public ICollection<FamilyMembership> Memberships { get; set; } = new List<FamilyMembership>();
}