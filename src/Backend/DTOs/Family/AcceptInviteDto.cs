using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Family;

public class AcceptInviteDto
{
    [Required] [RegularExpression("^[0-9]{6}$", ErrorMessage = "Kod musi mieć 6 cyfr")] public string Code { get; set; }
}
