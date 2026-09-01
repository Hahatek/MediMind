using Backend.Data;
using Backend.Helpers;
using Backend.Models;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Fitness.v1;
using Google.Apis.Fitness.v1.Data;
using Google.Apis.Services;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class GoogleFitService : IGoogleFitService
{
    private static readonly string[] FitnessScopes =
    {
        "https://www.googleapis.com/auth/fitness.activity.read",
        "https://www.googleapis.com/auth/fitness.heart_rate.read",
        "https://www.googleapis.com/auth/fitness.sleep.read"
    };

    private const int SleepActivityType = 72; // stała Google Fit dla sesji typu "Sen"

    private readonly AppDbContext _context;
    private readonly GoogleFitOptions _options;
    private readonly IDataProtector _protector;

    public GoogleFitService(
        AppDbContext context,
        IOptions<GoogleFitOptions> options,
        IDataProtectionProvider dataProtectionProvider)
    {
        _context = context;
        _options = options.Value;
        _protector = dataProtectionProvider.CreateProtector("GoogleFitConnection.RefreshToken");
    }

    public string GetAuthorizationUrl(Guid userId)
    {
        var baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";

        var queryParametrs = new Dictionary<string, string?>
        {
            ["client_id"] = _options.ClientId,
            ["redirect_uri"] = _options.RedirectUri,
            ["response_type"] = "code",
            ["scope"] = string.Join(" ", FitnessScopes),
            ["access_type"] = "offline",
            ["prompt"] = "consent",
            ["state"] = userId.ToString()
        };

        return QueryHelpers.AddQueryString(baseUrl, queryParametrs);
    }

    public async Task HandleOAuthCallbackAsync(string code, string state)
    {
        if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(state))
        {
            throw new ArgumentException("Brak code lub state w odpowiedzi Google");
        }

        if (!Guid.TryParse(state, out var userId))
        {
            throw new InvalidOperationException("Nieprawidłowy parametr state");
        }

        var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
        {
            ClientSecrets = new ClientSecrets
            {
                ClientId = _options.ClientId,
                ClientSecret = _options.ClientSecret
            },
            Scopes = FitnessScopes
        });

        var tokenRespone = await flow.ExchangeCodeForTokenAsync(
            userId: userId.ToString(),
            code: code,
            redirectUri: _options.RedirectUri,
            taskCancellationToken: CancellationToken.None
        );

        if (string.IsNullOrEmpty(tokenRespone.RefreshToken))
        {
            throw new InvalidOperationException(
                "Google nie zwrócił refresh_token");
        }

        var encryptedToken = _protector.Protect(tokenRespone.RefreshToken);

        var existingToken = await _context.GoogleFitConnections
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (existingToken is null)
        {
            _context.GoogleFitConnections.Add(new GoogleFitConnection
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                RefreshToken = encryptedToken,
                ConnectedAt = DateTime.UtcNow,
                ScopeGranted = string.Join(" ", FitnessScopes)
            });
        }
        else
        {
            existingToken.RefreshToken = encryptedToken;
            existingToken.ConnectedAt = DateTime.UtcNow;
        }
        await _context.SaveChangesAsync();
    }

    public async Task<bool> IsConnectedAsync(Guid userId)
    {
        var isConnected = await _context.GoogleFitConnections
            .AnyAsync(c => c.UserId == userId);

        return isConnected;
    }

    public async Task DisconnectAsync(Guid userId)
    {
        var connection = await _context.GoogleFitConnections
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (connection is not null)
        {
            _context.GoogleFitConnections.Remove(connection);
            await _context.SaveChangesAsync();
        }
    }

    // Zwraca sumę kroków użytkownika dla podanego dnia (Fitness API: users.dataset.aggregate)
    public async Task<int> GetStepsForDateAsync(Guid userId, DateOnly date)
    {
        var fitnessService = await GetFitnessServiceForUserAsync(userId);
        var (startMillis, endMillis) = GetDayRangeMillis(date);

        var aggregateRequest = new AggregateRequest
        {
            AggregateBy = new List<AggregateBy>
            {
                new AggregateBy { DataTypeName = "com.google.step_count.delta" }
            },
            BucketByTime = new BucketByTime { DurationMillis = endMillis - startMillis },
            StartTimeMillis = startMillis,
            EndTimeMillis = endMillis
        };

        var response = await fitnessService.Users.Dataset.Aggregate(aggregateRequest, "me").ExecuteAsync();

        var totalSteps = 0;
        if (response.Bucket is null)
        {
            return totalSteps;
        }

        foreach (var bucket in response.Bucket)
        {
            if (bucket.Dataset is null) continue;
            foreach (var dataset in bucket.Dataset)
            {
                if (dataset.Point is null) continue;
                foreach (var point in dataset.Point)
                {
                    if (point.Value is null) continue;
                    foreach (var value in point.Value)
                    {
                        totalSteps += value.IntVal ?? 0;
                    }
                }
            }
        }

        return totalSteps;
    }

    // Zwraca średnie/maks/min tętno z podanego dnia (Google Fit agreguje com.google.heart_rate.bpm
    // do com.google.heart_rate.summary z trzema wartościami w tej kolejności: średnia, maks, min)
    public async Task<HeartRateSummary> GetHeartRateForDateAsync(Guid userId, DateOnly date)
    {
        var fitnessService = await GetFitnessServiceForUserAsync(userId);
        var (startMillis, endMillis) = GetDayRangeMillis(date);

        var aggregateRequest = new AggregateRequest
        {
            AggregateBy = new List<AggregateBy>
            {
                new AggregateBy { DataTypeName = "com.google.heart_rate.bpm" }
            },
            BucketByTime = new BucketByTime { DurationMillis = endMillis - startMillis },
            StartTimeMillis = startMillis,
            EndTimeMillis = endMillis
        };

        var response = await fitnessService.Users.Dataset.Aggregate(aggregateRequest, "me").ExecuteAsync();

        double? average = null;
        double? max = null;
        double? min = null;

        if (response.Bucket is not null)
        {
            foreach (var bucket in response.Bucket)
            {
                if (bucket.Dataset is null) continue;
                foreach (var dataset in bucket.Dataset)
                {
                    if (dataset.Point is null) continue;
                    foreach (var point in dataset.Point)
                    {
                        if (point.Value is not { Count: >= 3 }) continue;
                        average = point.Value[0].FpVal;
                        max = point.Value[1].FpVal;
                        min = point.Value[2].FpVal;
                    }
                }
            }
        }

        return new HeartRateSummary(average, max, min);
    }

    // Zwraca łączny czas snu przypisany do danego dnia (okno: 18:00 dnia poprzedniego - 12:00 danego dnia,
    // żeby objąć typowy sen nocny). Fitness API: users.sessions.list, sesje typu Sleep (activityType 72).
    public async Task<TimeSpan> GetSleepForDateAsync(Guid userId, DateOnly date)
    {
        var fitnessService = await GetFitnessServiceForUserAsync(userId);

        var windowStart = date.AddDays(-1).ToDateTime(new TimeOnly(18, 0));
        var windowEnd = date.ToDateTime(new TimeOnly(12, 0));

        var request = fitnessService.Users.Sessions.List("me");
        request.StartTime = ToRfc3339(windowStart);
        request.EndTime = ToRfc3339(windowEnd);

        var response = await request.ExecuteAsync();

        var totalMillis = 0L;
        if (response.Session is not null)
        {
            foreach (var session in response.Session)
            {
                if (session.ActivityType != SleepActivityType) continue;
                if (!session.StartTimeMillis.HasValue || !session.EndTimeMillis.HasValue) continue;

                totalMillis += session.EndTimeMillis.Value - session.StartTimeMillis.Value;
            }
        }

        return TimeSpan.FromMilliseconds(totalMillis);
    }

    private static (long startMillis, long endMillis) GetDayRangeMillis(DateOnly date)
    {
        var startOfDay = date.ToDateTime(TimeOnly.MinValue);
        var endOfDay = startOfDay.AddDays(1);

        var startMillis = new DateTimeOffset(startOfDay, TimeSpan.Zero).ToUnixTimeMilliseconds();
        var endMillis = new DateTimeOffset(endOfDay, TimeSpan.Zero).ToUnixTimeMilliseconds();

        return (startMillis, endMillis);
    }

    private static string ToRfc3339(DateTime dateTime)
    {
        return new DateTimeOffset(dateTime, TimeSpan.Zero).ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
    }

    private async Task<FitnessService> GetFitnessServiceForUserAsync(Guid userId)
    {
        var connection = await _context.GoogleFitConnections
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (connection is null)
        {
            throw new InvalidOperationException(
                "brak podpiętego Google Fit");
        }

        var refreshToken = _protector.Unprotect(connection.RefreshToken);

        var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
        {
            ClientSecrets = new ClientSecrets
            {
                ClientId = _options.ClientId,
                ClientSecret = _options.ClientSecret
            },
            Scopes = FitnessScopes
        });

        var credential = new UserCredential(flow, userId.ToString(), new TokenResponse
        {
            RefreshToken = refreshToken
        });

        var fitnessService = new FitnessService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = "MediMind"
        });

        return fitnessService;
    }
}
