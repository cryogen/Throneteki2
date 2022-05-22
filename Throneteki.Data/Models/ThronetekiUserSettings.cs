namespace Throneteki.Data.Models;

public class ThronetekiUserSettings
{
    public string? CustomBackgroundUrl { get; set; }
    public string? Background { get; set; }
    public Dictionary<string, bool> ActionWindows { get; set; } = new();
}