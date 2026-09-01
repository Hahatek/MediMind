namespace Backend.Services;

public interface IGoogleFitService
{
    string GetAuthorizationUrl(Guid userId);

    Task HandleOAuthCallbackAsync(string code, string state);

    Task DisconnectAsync(Guid userId);

    Task<bool> IsConnectedAsync(Guid userId);

    Task<int> GetStepsForDateAsync(Guid userId, DateOnly date);

    Task<HeartRateSummary> GetHeartRateForDateAsync(Guid userId, DateOnly date);

    Task<TimeSpan> GetSleepForDateAsync(Guid userId, DateOnly date);
}

public record HeartRateSummary(double? AverageBpm, double? MaxBpm, double? MinBpm);
