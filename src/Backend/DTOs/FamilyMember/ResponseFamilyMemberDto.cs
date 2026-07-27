namespace Backend.DTOs.FamilyMember;

public class ResponseFamilyMemberDto
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public Guid MemberId { get; set; }
    public string? Relation { get; set; }
    public bool? CanEdit { get; set; }
    public DateTime CreatedAt { get; set; }
    public string MemberFirstName { get; set; }
    public string MemberLastName { get; set; }
}