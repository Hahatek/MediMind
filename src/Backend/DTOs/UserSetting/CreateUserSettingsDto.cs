namespace Backend.DTOs.UserSetting;

public class CreateUserSettingsDto
{
    public Guid UserId { get; set; }
    public bool DarkMode { get; set; }
    public int FontSize { get; set; }
}