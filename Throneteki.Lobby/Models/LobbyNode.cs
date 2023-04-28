namespace Throneteki.Lobby.Models;

public class LobbyNode
{
    public int MaxGames { get; set; }
    public string? Version { get; set; }
    public string? Url { get; set; }
    public string Name { get; set; } = null!;
    public List<LobbyGame> Games { get; set; } = new();
}