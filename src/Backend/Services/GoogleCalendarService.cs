using System.ComponentModel;
using Backend.Data;
using Backend.Helpers;
using Backend.Models;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Calendar.v3;
using Google.Apis.Services;
using Microsoft.EntityFrameworkCore;
using Google.Apis.Calendar.v3.Data;
using Microsoft.Extensions.Caching.Memory;

namespace Backend.Services;

public class GoogleCalendarService : IGoogleCalendarService
{
    private readonly AppDbContext _context;
    private readonly GoogleCalendarOptions _options;
    private readonly IDataProtector _protector;
    private readonly IMemoryCache _cache;

    public GoogleCalendarService(
        AppDbContext context,
        IOptions<GoogleCalendarOptions> options,
        IDataProtectionProvider dataProtectionProvider,
        IMemoryCache cache)
    {
        _context = context;
        _options = options.Value;
        _protector = dataProtectionProvider.CreateProtector("GoogleCalendarConnection.RefreshToken");
        _cache = cache;

    }

    public string GetAuthorizationUrl(Guid userId)
    {
        var baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";

        var stateToken = Guid.NewGuid().ToString();
        
        _cache.Set(stateToken, userId, TimeSpan.FromMinutes(10));
        
        var queryParametrs = new Dictionary<string, string?>
        {
            ["client_id"] = _options.ClientId,
            ["redirect_uri"] = _options.RedirectUri,
            ["response_type"] = "code",
            ["scope"] = "https://www.googleapis.com/auth/calendar.events",
            ["access_type"] = "offline",
            ["prompt"] = "consent",
            ["state"] = stateToken,
        };
        
        return QueryHelpers.AddQueryString(baseUrl, queryParametrs);
    }

    public async  Task HandleOAuthCallbackAsync(string code, string state)
    {
        if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(state))
        {
            throw new ArgumentException("Brak code lub state w odpowiedzi Google");
        }
        
        // zwraca nam więcej niż jedna wartość dlatego dajemy out
        if (!_cache.TryGetValue(state, out Guid userId))
        {
            throw new InvalidOperationException("Nieprawidłowy parametr state");
        }
        
        _cache.Remove(state);

        var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
        {
            ClientSecrets = new ClientSecrets
            {
                ClientId = _options.ClientId,
                ClientSecret = _options.ClientSecret
            },
            Scopes = new[] { "https://www.googleapis.com/auth/calendar.events" }
        });

        var tokenRespone = await flow.ExchangeCodeForTokenAsync(
            userId: userId.ToString(),
            code: code,
            redirectUri: _options.RedirectUri,
            taskCancellationToken: CancellationToken.None // CancellationToken.None operacje będzie leciała do końca jej wykonania
        );

        if (string.IsNullOrEmpty(tokenRespone.RefreshToken))
        {
            throw new InvalidOperationException(
                "Google nie zwrócił refresh_token");
        }
        
        var encryptedToken = _protector.Protect(tokenRespone.RefreshToken);
        
        var existingToken = await _context.GoogleCalendarConnections
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (existingToken is null)
        {
            _context.GoogleCalendarConnections.Add(new GoogleCalendarConnection
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                RefreshToken = encryptedToken,
                ConnectedAt = DateTime.UtcNow,
                ScopeGranted = "https://www.googleapis.com/auth/calendar.events"
            });
        }
        else
        {
            existingToken.RefreshToken = encryptedToken;
            existingToken.ConnectedAt = DateTime.UtcNow;
        }
        await _context.SaveChangesAsync();
    }
    
    // Do tworzenia powiadomień o badaniach
    
    public async Task<GoogleSyncResult> CreateEventAsyncExamination(Examination examination)
    {
        try
        {
            var calendarService = await GetCalendarServiceForUserAsync(examination.UserId);

            DateTime startDateTime;

            if (examination.Time.HasValue)
            {
                startDateTime = examination.Date.ToDateTime(examination.Time.Value);
            }
            else
            {
                startDateTime = examination.Date.ToDateTime(new TimeOnly(9, 0));
            }

            var endDateTime = startDateTime.AddMinutes(30);

            List<string>? recurrence = null;
            if (examination.IsCyclic)
            {
                var interval = examination.CycleInterval ?? 1;
                recurrence = new List<string> { $"RRULE:FREQ=MONTHLY;INTERVAL={interval}" };
            }
            
            var newEvent = new Event
            {
                Summary = examination.Name,
                Description = examination.Description,
                Location = examination.Location,
                Recurrence =  recurrence ,

                Start = new EventDateTime
                {
                    DateTimeDateTimeOffset =
                        new DateTimeOffset(startDateTime, TimeZoneInfo.Local.GetUtcOffset(startDateTime)),
                    TimeZone = "Europe/Warsaw"
                },
                End = new EventDateTime
                {
                    DateTimeDateTimeOffset =
                        new DateTimeOffset(endDateTime, TimeZoneInfo.Local.GetUtcOffset(endDateTime)),
                    TimeZone = "Europe/Warsaw"
                }
            };

            var request = calendarService.Events.Insert(newEvent, "primary");
            var createdEvent = await request.ExecuteAsync();
            examination.GoogleEventId = createdEvent.Id;
            examination.SyncStatus = GoogleSyncStatus.Synced;
            examination.LastSyncError = null;

            return new GoogleSyncResult(true, null, createdEvent.Id);
        }
        catch (Exception e)
        {
            examination.SyncStatus = GoogleSyncStatus.Failed;
            examination.LastSyncError = e.Message;

            return new GoogleSyncResult(false, e.Message, null);
        }
    }
    public async Task<GoogleSyncResult> UpdateEventAsyncExamination(Examination examination)
    {
        if (string.IsNullOrEmpty(examination.GoogleEventId))
        {
            return await CreateEventAsyncExamination(examination);
        }

        
        try
        {
            var calendarService = await GetCalendarServiceForUserAsync(examination.UserId);

            DateTime startDateTime;

            if (examination.Time.HasValue)
            {
                startDateTime = examination.Date.ToDateTime(examination.Time.Value);
            }
            else
            {
                startDateTime = examination.Date.ToDateTime(new TimeOnly(9, 0));
            }

            var endDateTime = startDateTime.AddMinutes(30);

            List<string>? recurrence = null;
            if (examination.IsCyclic)
            {
                var interval = examination.CycleInterval ?? 1;
                recurrence = new List<string> { $"RRULE:FREQ=MONTHLY;INTERVAL={interval}" };
            }

            var newEvent = new Event
            {
                Summary = examination.Name,
                Description = examination.Description,
                Location = examination.Location,
                Recurrence = recurrence,

                Start = new EventDateTime
                {
                    DateTimeDateTimeOffset =
                        new DateTimeOffset(startDateTime, TimeZoneInfo.Local.GetUtcOffset(startDateTime)),
                    TimeZone = "Europe/Warsaw"
                },
                End = new EventDateTime
                {
                    DateTimeDateTimeOffset =
                        new DateTimeOffset(endDateTime, TimeZoneInfo.Local.GetUtcOffset(endDateTime)),
                    TimeZone = "Europe/Warsaw"
                }
            };

            var request = calendarService.Events.Update(newEvent, "primary", examination.GoogleEventId);
            var createdEvent = await request.ExecuteAsync();
            examination.GoogleEventId = createdEvent.Id;
            examination.SyncStatus = GoogleSyncStatus.Synced;
            examination.LastSyncError = null;

            return new GoogleSyncResult(true, null, createdEvent.Id);
        }
        catch (Exception e)
        {
            examination.SyncStatus = GoogleSyncStatus.Failed;
            examination.LastSyncError = e.Message;

            return new GoogleSyncResult(false, e.Message, null);
        }   
    }

    public async Task<GoogleSyncResult> DeleteEventAsyncExamination(Examination examination)
    {
        if (string.IsNullOrEmpty(examination.GoogleEventId))
        {
            return new GoogleSyncResult(true, null, null);
        }
        
        try
        {
            var calendarService = await GetCalendarServiceForUserAsync(examination.UserId);

            var request = calendarService.Events.Delete("primary", examination.GoogleEventId);
            await request.ExecuteAsync();

            examination.GoogleEventId = null;
            examination.SyncStatus = GoogleSyncStatus.Synced;
            examination.LastSyncError = null;

            return new GoogleSyncResult(true, null, null);
        }
        catch (Exception e)
        {
            examination.SyncStatus = GoogleSyncStatus.Failed;
            examination.LastSyncError = e.Message;

            return new GoogleSyncResult(false, e.Message, null);
        }
    }

    public async Task<GoogleSyncResult> RetrySyncAsyncExamination(Examination examination)
    {
        return await UpdateEventAsyncExamination(examination);
    }

    // Do tworzenia powiadomień o lekach
    
    public async Task<GoogleSyncResult> CreateEventAsyncMedicationSchedule(MedicationSchedule schedule)
    {
        try
        {
            var calendarService = await GetCalendarServiceForUserAsync(schedule.Medication.UserId);
            
            DateOnly scheduleDate;
            if (schedule.Medication.StartDate.HasValue)
            {
                scheduleDate = schedule.Medication.StartDate.Value;
            }
            else
            {
                scheduleDate = DateOnly.FromDateTime(DateTime.Today);
            }

            TimeOnly scheduleTime;
            if (schedule.Time.HasValue)
            {
                scheduleTime = schedule.Time.Value;
            }
            else
            {
                if (schedule.TimeOfDay == MedicationTime.Morning)
                {
                    scheduleTime = new TimeOnly(8, 0);
                }
                else if (schedule.TimeOfDay == MedicationTime.Afternoon)
                {
                    scheduleTime = new TimeOnly(12, 0);
                }
                else if (schedule.TimeOfDay == MedicationTime.Evening)
                {
                    scheduleTime = new TimeOnly(20, 0);
                }
                else
                {
                    scheduleTime = new TimeOnly(22, 0);
                }
            }
            
            
            DateTime startDateTime = scheduleDate.ToDateTime(scheduleTime);
            
            var endDateTime = startDateTime.AddMinutes(30);
            
            string recurrenceRule;
            if (schedule.Medication.EndDate.HasValue)
            {
                var untilDate = schedule.Medication.EndDate.Value.ToString("yyyyMMdd");
                recurrenceRule = $"RRULE:FREQ=DAILY;UNTIL={untilDate}T235959Z";
            }
            else
            {
                recurrenceRule = "RRULE:FREQ=DAILY";
            }
            
            var newEvent = new Event
            {
                Summary = schedule.Medication.Name,
                Description = $"Dawka: {schedule.Medication.Dose}",
                Recurrence = new List<string> { recurrenceRule },

                Start = new EventDateTime
                {
                    DateTimeDateTimeOffset =
                        new DateTimeOffset(startDateTime, TimeZoneInfo.Local.GetUtcOffset(startDateTime)),
                    TimeZone = "Europe/Warsaw"
                },
                End = new EventDateTime
                {
                    DateTimeDateTimeOffset =
                        new DateTimeOffset(endDateTime, TimeZoneInfo.Local.GetUtcOffset(endDateTime)),
                    TimeZone = "Europe/Warsaw"
                }
            };

            var request = calendarService.Events.Insert(newEvent, "primary");
            var createdEvent = await request.ExecuteAsync();
            schedule.GoogleEventId = createdEvent.Id;
            schedule.SyncStatus = GoogleSyncStatus.Synced;
            schedule.LastSyncError = null;

            return new GoogleSyncResult(true, null, createdEvent.Id);
        }
        catch (Exception e)
        {
            schedule.SyncStatus = GoogleSyncStatus.Failed;
            schedule.LastSyncError = e.Message;

            return new GoogleSyncResult(false, e.Message, null);
        }
    }
    
    public async Task<GoogleSyncResult> UpdateEventAsyncMedicationSchedule(MedicationSchedule schedule)
    {
        if (string.IsNullOrEmpty(schedule.GoogleEventId))
        {
            return await CreateEventAsyncMedicationSchedule(schedule);
        }
          
       try
        {
            var calendarService = await GetCalendarServiceForUserAsync(schedule.Medication.UserId);
            
            DateOnly scheduleDate;
            if (schedule.Medication.StartDate.HasValue)
            {
                scheduleDate = schedule.Medication.StartDate.Value;
            }
            else
            {
                scheduleDate = DateOnly.FromDateTime(DateTime.Today);
            }

            TimeOnly scheduleTime;
            if (schedule.Time.HasValue)
            {
                scheduleTime = schedule.Time.Value;
            }
            else
            {
                if (schedule.TimeOfDay == MedicationTime.Morning)
                {
                    scheduleTime = new TimeOnly(8, 0);
                }
                else if (schedule.TimeOfDay == MedicationTime.Afternoon)
                {
                    scheduleTime = new TimeOnly(12, 0);
                }
                else if (schedule.TimeOfDay == MedicationTime.Evening)
                {
                    scheduleTime = new TimeOnly(20, 0);
                }
                else
                {
                    scheduleTime = new TimeOnly(22, 0);
                }
            }
            
            
            DateTime startDateTime = scheduleDate.ToDateTime(scheduleTime);
            
            var endDateTime = startDateTime.AddMinutes(30);
            
            string recurrenceRule;
            if (schedule.Medication.EndDate.HasValue)
            {
                var untilDate = schedule.Medication.EndDate.Value.ToString("yyyyMMdd");
                recurrenceRule = $"RRULE:FREQ=DAILY;UNTIL={untilDate}T235959Z";
            }
            else
            {
                recurrenceRule = "RRULE:FREQ=DAILY";
            }
            
            var newEvent = new Event
            {
                Summary = schedule.Medication.Name,
                Description = $"Dawka: {schedule.Medication.Dose}",
                Recurrence = new List<string> { recurrenceRule },

                Start = new EventDateTime
                {
                    DateTimeDateTimeOffset =
                        new DateTimeOffset(startDateTime, TimeZoneInfo.Local.GetUtcOffset(startDateTime)),
                    TimeZone = "Europe/Warsaw"
                },
                End = new EventDateTime
                {
                    DateTimeDateTimeOffset =
                        new DateTimeOffset(endDateTime, TimeZoneInfo.Local.GetUtcOffset(endDateTime)),
                    TimeZone = "Europe/Warsaw"
                }
            };

            var request = calendarService.Events.Update(newEvent, "primary", schedule.GoogleEventId);
            var createdEvent = await request.ExecuteAsync();
            schedule.GoogleEventId = createdEvent.Id;
            schedule.SyncStatus = GoogleSyncStatus.Synced;
            schedule.LastSyncError = null;

            return new GoogleSyncResult(true, null, createdEvent.Id);
        }
        catch (Exception e)
        {
            schedule.SyncStatus = GoogleSyncStatus.Failed;
            schedule.LastSyncError = e.Message;

            return new GoogleSyncResult(false, e.Message, null);
        }
    }

    public async Task<GoogleSyncResult> DeleteEventAsyncMedicationSchedule(MedicationSchedule schedule)
    {
        if (string.IsNullOrEmpty(schedule.GoogleEventId))
        {
            return new GoogleSyncResult(true, null, null);
        }
        
        try
        {
            var calendarService = await GetCalendarServiceForUserAsync(schedule.Medication.UserId);

            var request = calendarService.Events.Delete("primary", schedule.GoogleEventId);
            await request.ExecuteAsync();

            schedule.GoogleEventId = null;
            schedule.SyncStatus = GoogleSyncStatus.Synced;
            schedule.LastSyncError = null;

            return new GoogleSyncResult(true, null, null);
        }
        catch (Exception e)
        {
            schedule.SyncStatus = GoogleSyncStatus.Failed;
            schedule.LastSyncError = e.Message;

            return new GoogleSyncResult(false, e.Message, null);
        }
    }

    public async Task<GoogleSyncResult> RetrySyncAsyncMedicationSchedule(MedicationSchedule schedule)
    {
        return await UpdateEventAsyncMedicationSchedule(schedule);
    }

    public async Task<bool> IsConnectedAsync(Guid userId)
    {   
        var isConnected = await _context.GoogleCalendarConnections
            .AnyAsync(c => c.UserId == userId);

        return isConnected;
    }

    public async Task DisconnectAsync(Guid userId)
    {
        var connection = await _context.GoogleCalendarConnections
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (connection is not null)
        {
            _context.GoogleCalendarConnections.Remove(connection);
            await _context.SaveChangesAsync();
        }
    }
    
    private async Task<CalendarService> GetCalendarServiceForUserAsync(Guid userId)
    {
        var connection = await _context.GoogleCalendarConnections
            .FirstOrDefaultAsync(c =>  c.UserId == userId);

        if (connection is null)
        {
            throw new InvalidOperationException(
                $"brak podpiętego kalendarza");
        }

        var refreshToken = _protector.Unprotect(connection.RefreshToken);

        var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
        {
            ClientSecrets = new ClientSecrets
            {
                ClientId = _options.ClientId,
                ClientSecret = _options.ClientSecret
            },
            Scopes = new[] { "https://www.googleapis.com/auth/calendar.events" }
        });

        var credential = new UserCredential(flow, userId.ToString(), new TokenResponse
        {
            RefreshToken = refreshToken
        });

        var calendarService = new CalendarService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = "MediMind"
        });
        
        return calendarService;
        
    }

    
    
}   