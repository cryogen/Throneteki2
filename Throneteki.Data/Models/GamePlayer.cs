using System.ComponentModel.DataAnnotations;

namespace Throneteki.Data.Models;

public class GamePlayer
{
    public int Id { get; set; }
    [Required]
    public string PlayerId { get; set; } = null!;
    public ThronetekiUser? Player { get; set; }
    public int DeckId { get; set; }
    public virtual Deck Deck { get; set; } = null!;
    public int TotalPower { get; set; }
    public int GameId { get; set; }
    public Game Game { get; set; } = null!;
}