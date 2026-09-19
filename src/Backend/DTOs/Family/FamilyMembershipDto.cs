namespace Backend.DTOs.Family;

public class FamilyMembershipDto
{
    public Guid UserId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public bool IsOwner { get; set; }
    public bool IsParent { get; set; }
}