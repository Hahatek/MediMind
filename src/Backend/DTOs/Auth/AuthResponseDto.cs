namespace Backend.DTOs.Auth;

public class AuthResponseDto
{
    public required string Token {get; set;}
    public required string RefreshToken {get; set;}
}