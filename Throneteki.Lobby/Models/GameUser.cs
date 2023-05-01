namespace Throneteki.Lobby.Models;

public class GameUser
{
    public GameUserType GameUserType { get; set; }
    public string Name => User.Name;
    public LobbyGamePlayer User { get; set; } = null!;
    public bool HasLeft { get; set; }
}