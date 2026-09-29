namespace Backend.Helpers;

// "Dzisiaj" według czasu polskiego (z uwzględnieniem czasu letniego/zimowego).
// Używane tam, gdzie od daty zależą uprawnienia (AgeCategory) — liczone na serwerze, nigdy z telefonu.
public static class PolandClock
{
    private static readonly TimeZoneInfo PolandTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Warsaw");

    public static DateOnly Today()
    {
        return DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, PolandTimeZone));
    }
}
