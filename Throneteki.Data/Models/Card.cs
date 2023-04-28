using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace Throneteki.Data.Models;

[Index(nameof(Code), IsUnique = true)]
public class Card
{
    public int Id { get; set; }

    [Required]
    public string Code { get; set; } = null!;

    public string? Type { get; set; }
    public string? Name { get; set; }
    public bool Unique { get; set; }
    public int FactionId { get; set; }
    public Faction Faction { get; set; } = null!;
    public bool Loyal { get; set; }
    public int Cost { get; set; }
    public int? Strength { get; set; }
    public string? Text { get; set; }
    public string? Flavor { get; set; }
    public int DeckLimit { get; set; }
    public string? Illustrator { get; set; }
    public int PackId { get; set; }
    public Pack Pack { get; set; } = null!;
    public string? Label { get; set; }
    public string? Icons { get; set; }
    public string? Traits { get; set; }
    public int? Income { get; set; }
    public int? Claim { get; set; }
    public int? Reserve { get; set; }
    public int? Initiative { get; set; }
    public bool Military { get; set; }
    public bool Intrigue { get; set; }
    public bool Power { get; set; }
    public string? ImageUrl { get; set; }
}