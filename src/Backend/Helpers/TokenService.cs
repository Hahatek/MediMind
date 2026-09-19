using System;
using System.Text;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Collections.Generic;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Backend.Data;
using Backend.Models;

namespace Backend.Helpers;

public class TokenService : ITokenService
{
    
    private readonly AppDbContext _context;
    private readonly JwtSettings _jwtSettings;
    
    public TokenService(AppDbContext context, JwtSettings jwtSettings)
    {
        _context = context;
        _jwtSettings = jwtSettings;

    }
    
    public string GenerateToken(User user)
    {
        var claims = new List<Claim> {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString() ),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
        };
        
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        
        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiresIn),
            signingCredentials: creds
        );
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<(RefreshToken Entity, string RawToken)> GenerateRefreshTokenAsync(Guid userId)
    {
        var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = HashRefreshToken(rawToken),
            IssuedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(15),
            RevokedAt = null
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return (refreshToken, rawToken);
    }

    public string HashRefreshToken(string rawToken)
    {
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToBase64String(hashBytes);
    }

}