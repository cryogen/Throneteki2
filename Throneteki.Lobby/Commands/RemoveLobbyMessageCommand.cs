namespace Throneteki.Lobby.Commands;

public class RemoveLobbyMessageCommand : ILobbyCommand
{ 
    public int MessageId { get; set; }
    public string ConnectionId { get; set; } = null!;
    public string Username { get; set; } = null!;
}