using System.ComponentModel.DataAnnotations;

namespace Throneteki.Data.Models
{
    public class Deck
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; } = null!;
        [Required]
        public string UserId { get; set; } = null!;
        public ThronetekiUser User { get; set; } = null!;
        public int FactionId { get; set; }
        public Faction Faction { get; set; } = null!;
        public int? AgendaId { get; set; }
        public Card? Agenda { get; set; }
        public ICollection<DeckCard> DeckCards { get; set; } = new List<DeckCard>();
        public DateTime Created { get; set; }
        public DateTime Updated { get; set; }
        public string? ExternalId { get; set; }
    }
}
