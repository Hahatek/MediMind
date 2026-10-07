namespace Backend.DTOs.Family;

public class FamilyMembershipDto
{
    public Guid UserId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public bool IsOwner { get; set; }
    public bool IsParent { get; set; }
    public bool HasAccount { get; set; }
    public bool IsChild { get; set; }
    public bool IsPrimaryGuardianForMe { get; set; }
    public bool IsMe { get; set; }
    public bool CanManage { get; set; }
    
}
