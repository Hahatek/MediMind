using Backend.Helpers;

namespace Backend.DTOs.Examination;

public class ExaminationResponseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly? Time { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Location { get; set; }
    public ExaminationsStatus Status { get; set; }
    public bool IsCyclic { get; set; }
    public int? CycleInterval { get; set; }
    public string? Preparation { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public string? Doctor { get; set;  }
    public string? GoogleEventId { get; set; } // służy do synchornizacji z kalendarzem google
}