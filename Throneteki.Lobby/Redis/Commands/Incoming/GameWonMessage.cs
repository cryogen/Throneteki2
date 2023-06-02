using Throneteki.Lobby.Models;

namespace Throneteki.Lobby.Redis.Commands.Incoming;

public class GameWonMessage
{
    public LobbySavedGame? Game { get; set; }
    public string? Winner { get; set; }
    public string? Reason { get; set; }
}