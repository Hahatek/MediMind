namespace Backend.Models;

public class ExaminationHide
{
    public Guid Id { get; set; }
    public Guid ExaminationId { get; set; }
    public Guid HiddenForUserId { get; set; }
    public Guid HiddenByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public Examination Examination { get; set; }
    public User HiddenForUser { get; set; }
    public User HiddenByUser { get; set; }
}
