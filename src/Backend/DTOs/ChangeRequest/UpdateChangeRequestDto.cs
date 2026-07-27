using Backend.Helpers;
using Backend.Models;

namespace Backend.DTOs.ChangeRequest;

public class UpdateChangeRequestDto
{
    public ChangeRequestStatus Status { get; set; }
    public string? ProposedChanges { get; set; }
    public string? Reason { get; set; }
}