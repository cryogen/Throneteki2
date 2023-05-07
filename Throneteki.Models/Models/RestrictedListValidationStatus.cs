namespace Throneteki.Models.Models;

public class RestrictedListValidationStatus
{
    public string Name { get; set; } = null!;
    public bool Valid { get; set; }
    public bool RestrictedRules { get; set; }
    public bool NoBannedCards { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<LobbyCard> RestrictedCards { get; set; } = new();
    public List<LobbyCard> BannedCards { get; set; } = new();
    public string? Version { get; set; }
}