namespace Throneteki.Data.Models;

public class Game
{
    public int Id { get; set; }
    public Guid GameId { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }
    public string? WinnerId { get; set; }
    public ThronetekiUser? Winner { get; set; }
    public string? WinReason { get; set; }
    public ICollection<GamePlayer> Players { get; set; } = new List<GamePlayer>();
}