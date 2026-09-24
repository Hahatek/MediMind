using Backend.Helpers;

namespace Backend.DTOs.User;

public class UpdateUserDto
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public DateOnly? BirthDate { get; set; }
    public Gender? Gender { get; set; }
    public double? Height { get; set; }
    public double? Weight { get; set; }
    public BloodType? BloodType { get; set; }
    public string? Avatar { get; set; }
}
