namespace Backend.DTOs.Family;

public class ResponseFamilyInviteDto
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    // Jawny kod pokazujemy tylko raz, w odpowiedzi na utworzenie — w bazie jest wyłącznie jego HMAC.
    public string Code { get; set; }
    public DateTime ExpiresAt { get; set; }
}