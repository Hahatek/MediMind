namespace Backend.DTOs.FamilyMember;

public class CreateFamilyMemberDto
{
    public Guid OwnerId { get; set; }
    public Guid MemberId { get; set; }
    public string? Relation { get; set; }
    public bool? CanEdit { get; set; }
}