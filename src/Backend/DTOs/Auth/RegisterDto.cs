using System.ComponentModel.DataAnnotations;
using Backend.Helpers;

namespace Backend.DTOs.Auth;

public class RegisterDto
{
    [Required] [MaxLength(128)] public string FirstName {get; set;}
    [Required] [MaxLength(128)] public string LastName {get; set;}
    [Required] [MaxLength(254)] [EmailAddress] public string Email {get; set;}
    [Required] [RegularExpression("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,128}$")] public string Password {get; set;}
    [Required] [Compare(nameof(Password), ErrorMessage = "Hasła nie są identyczne")] public string ConfirmPassword {get; set;}
    [BirthDate] public DateOnly BirthDate {get; set;}
    
}