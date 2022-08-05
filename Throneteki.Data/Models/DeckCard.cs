using System.ComponentModel.DataAnnotations;

namespace Throneteki.Data.Models
{
    public class DeckCard
    {
        public int DeckId { get; set; }
        public Deck Deck { get; set; } = null!;
        public int CardId { get; set; }
        public Card Card { get; set; } = null!;
        public DeckCardType CardType { get; set; }
        public int Count { get; set; }
    }
}
