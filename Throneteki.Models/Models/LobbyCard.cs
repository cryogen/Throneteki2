namespace Throneteki.Models.Models;

public class LobbyCard
{
    public string Code { get; set; } = null!;
    public string? Type { get; set; }
    public string? Name { get; set; }
    public bool Unique { get; set; }
    public string Faction { get; set; } = null!;
    public bool Loyal { get; set; }
    public int Cost { get; set; }
    public int? Strength { get; set; }
    public string? Text { get; set; }
    public string? Flavor { get; set; }
    public int DeckLimit { get; set; }
    public string? Illustrator { get; set; }
    public string PackCode { get; set; } = null!;
    public string? Label { get; set; }
    public string[] Icons { get; set; } = Array.Empty<string>();
    public string[] Traits { get; set; } = Array.Empty<string>();
    public int? Income { get; set; }
    public int? Claim { get; set; }
    public int? Reserve { get; set; }
    public bool Power { get; set; }
    public string? ImageUrl { get; set; }
}