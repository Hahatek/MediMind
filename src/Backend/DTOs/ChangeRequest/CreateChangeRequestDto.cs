using Backend.Helpers;
using Backend.Models;

namespace Backend.DTOs.ChangeRequest;

public class CreateChangeRequestDto
{
    public Guid ExaminationId { get; set; }
    public Guid RequestedBy { get; set; }
    public ChangeRequestStatus Status { get; set; }
    public string? ProposedChanges { get; set; }
    public string? Reason { get; set; }
}