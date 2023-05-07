namespace Throneteki.Models.Models;

public class DeckValidationStatus
{
    public bool BasicRules { get; set; }
    public bool FaqJoustRules { get; set; }
    public string? FaqVersion { get; set; }
    public bool NoBannedCards { get; set; }
    public bool NoUnreleasedCards { get; set; }
    public int PlotCount { get; set; }
    public int DrawCount { get; set; }
    public string[] Errors { get; set; } = Array.Empty<string>();
    public List<RestrictedListValidationStatus> RestrictedLists { get; set; } = new();
}