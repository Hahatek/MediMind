using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Helpers;

public static class ControllerExtensions
{
    public static Guid GetUserId(this ControllerBase controller)
    {
        var idClaim = controller.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (idClaim == null || !Guid.TryParse(idClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Brak poprawnego UserId w tokenie");
        }
        
        return userId;
    }

    public static RoleUser GetUserRole(this ControllerBase controller)
    {
        var roleClaim = controller.User.FindFirst(ClaimTypes.Role)?.Value;

        if (roleClaim == null || !Enum.TryParse<RoleUser>(roleClaim, out var role))
        {
            throw new UnauthorizedAccessException("Brak roli w tokenie");
        }

        return role;
    }
}