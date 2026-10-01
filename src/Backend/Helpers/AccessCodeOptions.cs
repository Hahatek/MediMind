namespace Backend.Helpers;

public class AccessCodeOptions
{
    public const int MinSecretLength = 32;
    public string Secret { get; set; } = "";
    public int AttemptsPerMinute { get; set; } = 5;
}

public static class RateLimitPolicies
{
    // Limit prób użycia kodu na adres IP — do endpointów, które przyjmują kod.
    public const string AccessCode = "access-code";
}
