using Throneteki.Data.Models;

namespace Throneteki.Web.Models.Decks;

public class DeckWithStats
{
    public Deck Deck { get; set; } = null!;
    public int Wins { get; set; }
    public int Losses { get; set; }
    public int? WinRate { get; set; }
}