namespace Backend.DTOs.FamilyMember;

public class UpdateFamilyMemberDto
{
    public string? Relation { get; set; }
    public bool? CanEdit { get; set; }
}