using Backend.Helpers;

namespace Backend.Models;

public class Examination
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly? Time { get; set; }
    public string Name { get; set; }
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
    public User? Owner { get; set; }
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<ChangeRequest> ChangeRequests { get; set; } = new List<ChangeRequest>();
}

