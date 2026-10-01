using System.ComponentModel.DataAnnotations;
using Backend.Helpers;

namespace Backend.DTOs.Family;

public class CreateManagedProfileDto
{
    [Required] [MaxLength(128)] public string FirstName { get; set; }
    [Required] [MaxLength(128)] public string LastName { get; set; }
    [Required(ErrorMessage = "Data urodzenia jest wymagana")] [BirthDate] public DateOnly? BirthDate { get; set; }
}
