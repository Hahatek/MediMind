namespace Backend.DTOs.Medication;

public class ResponseMedicationDto
{
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; }
        public string? Strength { get; set; }
        public string Form { get; set; }
        public string? Notes { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public DateOnly? DiscontinuedOn { get; set; }
}
