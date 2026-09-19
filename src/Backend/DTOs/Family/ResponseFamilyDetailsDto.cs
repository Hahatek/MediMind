namespace Backend.DTOs.Family;

public class ResponseFamilyDetailsDto
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsOwner {get; set;}
    public bool IsParent {get; set;}
    public List<FamilyMembershipDto> Members { get; set; }
}