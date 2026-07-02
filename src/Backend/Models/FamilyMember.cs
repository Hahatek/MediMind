namespace Backend.Models;

public class FamilyMember
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public Guid MemberId { get; set; }
    public string? Relation { get; set; }
    public bool? CanEdit { get; set; }
    public DateTime CreatedAt { get; set; }
    public User Owner { get; set; }
    public User Member { get; set; }
}