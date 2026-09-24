using System.ComponentModel.DataAnnotations;

namespace Backend.Helpers;

public class BirthDateAttribute : ValidationAttribute
{
    private static readonly DateOnly MinDate = new(1900, 1, 1);

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not DateOnly birthDate)
        {
            return new ValidationResult("Nieprawidłowy format daty.");
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        if (birthDate > today)
        {
            return new ValidationResult("Data urodzenia nie może być z przyszłości.");
        }

        if (birthDate < MinDate)
        {
            return new ValidationResult("Data urodzenia nie może być wcześniejsza niż 1900-01-01.");
        }

        return ValidationResult.Success;
    }
}
