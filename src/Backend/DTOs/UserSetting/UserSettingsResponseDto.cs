namespace Backend.DTOs.UserSetting;

public class UserSettingsResponseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public bool DarkMode { get; set; }
    public int FontSize { get; set; }
}