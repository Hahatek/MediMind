using Backend.Helpers;
using Backend.Models;

namespace Backend.DTOs.ChangeRequest;

public class ResponseChangeRequestDto
{
    public Guid Id { get; set; }
    public Guid ExaminationId { get; set; }
    public Guid RequestedBy { get; set; }
    public Guid? ReviewedBy { get; set; }
    public ChangeRequestStatus Status { get; set; }
    public string? ProposedChanges { get; set; }
    public string? Reason { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Examination { get; set; }
    public string? CreatedBy { get; set; }
    public string? Reviewer { get; set; }
}