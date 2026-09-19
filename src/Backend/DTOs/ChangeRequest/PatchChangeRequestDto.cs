using Backend.Helpers;

namespace Backend.DTOs.ChangeRequest;

public class PatchChangeRequestDto
{
    // public ChangeRequestStatus? Status { get; set; }
    public string? ProposedChanges { get; set; }
    public string? Reason { get; set; }
}