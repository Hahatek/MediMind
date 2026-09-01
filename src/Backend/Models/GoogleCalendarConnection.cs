namespace Backend.Models;

public class GoogleCalendarConnection
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string RefreshToken { get; set; } 
    public DateTime ConnectedAt { get; set; }
    public string ScopeGranted { get; set; }
    
    public User User { get; set; }
}