namespace Backend.Helpers;

public static class AgeCategoryCalculator
{    
    private const int AdultFromAge = 18;
    private const int SeniorFromAge = 60;
    
    public static AgeCategory Calculate(DateOnly birthDate, DateOnly today)
    {

        var age = today.Year - birthDate.Year;

        if (birthDate.AddYears(age) > today)
        {
            age--;
        }
        if (age < AdultFromAge)
        {
            return AgeCategory.Child;
        }

        if (age < SeniorFromAge)
        {
            return AgeCategory.Adult;
        }  
        
        return AgeCategory.Senior;
    }
}