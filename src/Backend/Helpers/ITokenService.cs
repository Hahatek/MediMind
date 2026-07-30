using Backend.Models;

namespace Backend.Helpers;

public interface ITokenService
{
    string GenerateToken(User user);

}