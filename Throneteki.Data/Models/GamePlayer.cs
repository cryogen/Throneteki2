using System.ComponentModel.DataAnnotations;

namespace Throneteki.Data.Models;

public class GamePlayer
{
    public int Id { get; set; }
    [Required]
    public string PlayerId { get; set; } = null!;
    public ThronetekiUser? Player { get; set; }
    public int FactionId { get; set; }
    public Faction Faction { get; set; } = null!;
    public int? AgendaId { get; set; }
    public Card? Agenda { get; set; }
    public int TotalPower { get; set; }
}