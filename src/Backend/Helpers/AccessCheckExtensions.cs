using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Helpers;

// Zamienia odpowiedź AccessService na wynik HTTP w kontrolerach. null = dostęp jest.
// Kto może czytać dane (np. Kuba swoje, Tata jako członek rodziny), a nie może ich zmieniać -> 403:
// i tak wie, że dane istnieją. Kto nie może ich nawet czytać -> 404, żeby nie zdradzać, że istnieją.
public static class AccessCheckExtensions
{
    public static async Task<ActionResult?> CheckCanManageAsync(this ControllerBase controller,
        IAccessService accessService, Guid callerId, Guid ownerUserId, string notFoundMessage)
    {
        if (await accessService.CanManage(callerId, ownerUserId))
        {
            return null;
        }

        return await ForbidOrNotFoundAsync(controller, accessService, callerId, ownerUserId, notFoundMessage);
    }

    public static async Task<ActionResult?> CheckCanRecordIntakeAsync(this ControllerBase controller,
        IAccessService accessService, Guid callerId, Guid ownerUserId, string notFoundMessage)
    {
        if (await accessService.CanRecordIntake(callerId, ownerUserId))
        {
            return null;
        }

        return await ForbidOrNotFoundAsync(controller, accessService, callerId, ownerUserId, notFoundMessage);
    }

    // Operacje zastrzeżone dla opiekuna Primary (opiekunowie, kody dostępu). 404 bez treści: nie zdradzamy, że profil istnieje.
    public static async Task<ActionResult?> CheckIsPrimaryGuardianAsync(this ControllerBase controller,
        IAccessService accessService, Guid callerId, Guid wardId)
    {
        if (await accessService.IsPrimaryGuardian(callerId, wardId))
        {
            return null;
        }

        if (await accessService.CanRead(callerId, wardId))
        {
            return controller.Forbid();
        }

        return controller.NotFound();
    }

    private static async Task<ActionResult> ForbidOrNotFoundAsync(ControllerBase controller,
        IAccessService accessService, Guid callerId, Guid ownerUserId, string notFoundMessage)
    {
        if (await accessService.CanRead(callerId, ownerUserId))
        {
            return controller.Forbid();
        }

        return controller.NotFound(notFoundMessage);
    }
}
