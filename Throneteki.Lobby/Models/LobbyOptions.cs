namespace Throneteki.Lobby.Models;

public class LobbyOptions
{
    public const string OptionsName = "Lobby";

    public string? AuthServerUrl { get; set; }
    public string? LobbyServiceUrl { get; set; }
    public string? RedisUrl { get; set; }
    public int MinLobbyChatTime { get; set; }
}