namespace Throneteki.Data.Models;

public class ThronetekiUserSettings
{
    public Dictionary<string, bool> ActionWindows { get; set; } = new();
    public string? CustomBackgroundUrl { get; set; }
    public string Background { get; set; } = "standard";
    public string CardSize { get; set; } = "normal";
}