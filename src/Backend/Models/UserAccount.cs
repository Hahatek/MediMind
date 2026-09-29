namespace Backend.Models;

public class UserAccount
{
    public Guid UserId { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public DateTime CreatedAt { get; set; }

    public User User { get; set; }

}