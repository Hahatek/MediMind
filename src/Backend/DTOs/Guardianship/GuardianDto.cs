namespace Backend.DTOs.Guardianship;

public class GuardianDto
{
    public Guid UserId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public bool IsPrimary { get; set; }
}
