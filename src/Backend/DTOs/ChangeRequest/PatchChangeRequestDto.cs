using Backend.Helpers;

namespace Backend.DTOs.ChangeRequest;

public class PatchChangeRequestDto
{
    public Guid? ReviewedBy { get; set; }
    public ChangeRequestStatus? Status { get; set; }
    public string? ProposedChanges { get; set; }
    public string? Reason { get; set; }
    public DateTime? ReviewedAt { get; set; }
}