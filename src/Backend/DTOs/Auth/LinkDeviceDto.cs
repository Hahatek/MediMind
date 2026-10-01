using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Auth;

public class LinkDeviceDto
{
    [Required] [RegularExpression("^[0-9]{6}$", ErrorMessage = "Kod musi mieć 6 cyfr")] public string Code { get; set; }
}
