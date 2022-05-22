namespace Throneteki.Data.Models;

public class ThronetekiUserSettings
{
    public Dictionary<string, bool> ActionWindows { get; set; } = new();
    public string Background { get; set; } = "standard";
    public string CardSize { get; set; } = "normal";
    public bool ChooseCards { get; set; }
    public bool ChooseOrder { get; set; }
    public string? CustomBackgroundUrl { get; set; }
    public bool PromptDupes { get; set; }
    public bool TimerAbilities { get; set; }
    public bool TimerEvents { get; set; }
    public int WindowTimer { get; set; } = 10;
}