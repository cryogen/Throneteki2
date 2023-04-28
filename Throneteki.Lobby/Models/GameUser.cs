namespace Throneteki.Lobby.Models;

public class GameUser
{
    public GameUserType GameUserType { get; set; }
    public LobbyGamePlayer User { get; set; } = null!;
}