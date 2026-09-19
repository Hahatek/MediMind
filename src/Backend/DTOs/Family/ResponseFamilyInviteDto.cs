namespace Backend.DTOs.Family;

public class ResponseFamilyInviteDto
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    public DateTime ExpiresAt { get; set; }
}