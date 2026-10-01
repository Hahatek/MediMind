using Backend.Helpers;

namespace Backend.DTOs.AccessCode;

// Jedyna chwila, w której kod istnieje jawnie — później nie da się go odczytać, tylko wygenerować nowy.
public class AccessCodeDto
{
    public required string Code { get; set; }
    public CodeActionType ActionType { get; set; }
    public DateTime ExpiresAt { get; set; }
}
