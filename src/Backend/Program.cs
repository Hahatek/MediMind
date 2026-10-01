using Backend.Data;
using Backend.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;
using Backend.Services;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json.Serialization;
using Scalar.AspNetCore;
using System.Threading.RateLimiting;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddOpenApi();


builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
if (jwtSettings is null)
{
    throw new InvalidOperationException("Brak konfiguracji JwtSettings");
}

builder.Services.AddSingleton(jwtSettings);

builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
            ValidateLifetime = true,
        };
    });

builder.Services.Configure<GoogleCalendarOptions>(
    builder.Configuration.GetSection("GoogleCalendar"));

builder.Services.AddScoped<IGoogleCalendarService, GoogleCalendarService>();
builder.Services.AddScoped<IFamilyAccessService, FamilyAccessService>();
builder.Services.AddScoped<IAccessService, AccessService>();
builder.Services.AddScoped<IGoogleFitService, GoogleFitService>();

var accessCodeOptions = builder.Configuration.GetSection("AccessCodes").Get<AccessCodeOptions>() ?? new AccessCodeOptions();
if (accessCodeOptions.Secret.Length < AccessCodeOptions.MinSecretLength)
{
    throw new InvalidOperationException("Brak konfiguracji AccessCodes:Secret (min. 32 znaki) — ustaw przez user-secrets");
}

builder.Services.AddSingleton(accessCodeOptions);
builder.Services.AddScoped<IAccessCodeService, AccessCodeService>();
builder.Services.AddScoped<IFamilyInviteService, FamilyInviteService>();

// Limit prób użycia kodu: okno 1 minuty, po przekroczeniu -> 429.
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Endpointy anonimowe (link-device, claim-profile): osobny licznik na każdy adres IP.
    options.AddPolicy(RateLimitPolicies.AccessCode, httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = accessCodeOptions.AttemptsPerMinute,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));

    // Przyjęcie zaproszenia wymaga zalogowania: osobny licznik na każdego użytkownika (zmiana sieci go nie zeruje).
    options.AddPolicy(RateLimitPolicies.FamilyInviteAccept, httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? "ip:" + (httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"),
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = accessCodeOptions.AttemptsPerMinute,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));
});

builder.Services.Configure<GoogleFitOptions>(
    builder.Configuration.GetSection("GoogleFit"));

builder.Services.AddMemoryCache();

builder.Services.AddDataProtection();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.UseRateLimiter();

app.MapControllers();

app.Run();

