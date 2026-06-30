using Backend.Helpers;

namespace Backend.Models;

public class ChangeRequest
{
    public Guid Id { get; set; }
    public Guid ExaminationId { get; set; }
    public Guid RequestedBy { get; set; }
    public ChangeRequestStatus Status { get; set; }
    public string ProposedChanges { get; set; }
    public string? Reason { get; set; }
    public Guid? ReviewedBy { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}