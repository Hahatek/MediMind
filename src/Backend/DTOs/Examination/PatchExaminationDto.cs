using Backend.Helpers;

namespace Backend.DTOs.Examination;

public class PatchExaminationDto
{
    public string? Name { get; set; }
    public DateOnly? Date { get; set; }
    public TimeOnly? Time { get; set; }
    public string? Description { get; set; }
    public string? Location { get; set; }
    public ExaminationsStatus? Status { get; set; }
    public bool? IsCyclic { get; set; }
    public int? CycleInterval { get; set; }
    public string? Preparation { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public string? Doctor { get; set; }
}
