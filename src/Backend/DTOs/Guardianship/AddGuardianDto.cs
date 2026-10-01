using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Guardianship;

public class AddGuardianDto
{
    [Required] public Guid? GuardianUserId { get; set; }
}
