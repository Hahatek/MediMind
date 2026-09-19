using Backend.Models;

namespace Backend.Helpers;

public interface ITokenService
{
    string GenerateToken(User user);
    Task<(RefreshToken Entity, string RawToken)> GenerateRefreshTokenAsync(Guid userId);
    string HashRefreshToken(string rawToken);
}