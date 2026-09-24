using Backend.Helpers;

namespace Backend.DTOs.User;

public class PatchUserDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateOnly? BirthDate { get; set; }
    public Gender? Gender { get; set; }
    public double? Height { get; set; }
    public double? Weight { get; set; }
    public BloodType? BloodType { get; set; }
    public string? Avatar { get; set; }
}
