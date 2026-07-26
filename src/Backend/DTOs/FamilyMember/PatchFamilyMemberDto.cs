namespace Backend.DTOs.FamilyMember;

public class PatchFamilyMemberDto
{
    public string? Relation { get; set; }
    public bool? CanEdit { get; set; }
}