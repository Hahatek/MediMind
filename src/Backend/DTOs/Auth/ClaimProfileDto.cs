using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Auth;

// Przejęcie istniejącego profilu: kod od opiekuna Primary + dane logowania nowego konta (te same reguły co przy rejestracji).
public class ClaimProfileDto
{
    [Required] [RegularExpression("^[0-9]{6}$", ErrorMessage = "Kod musi mieć 6 cyfr")] public string Code { get; set; }
    [Required] [MaxLength(254)] [EmailAddress] public string Email { get; set; }
    [Required] [RegularExpression("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,128}$")] public string Password { get; set; }
    [Required] [Compare(nameof(Password), ErrorMessage = "Hasła nie są identyczne")] public string ConfirmPassword { get; set; }
}
