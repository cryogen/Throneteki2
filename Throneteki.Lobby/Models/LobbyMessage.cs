namespace Throneteki.Lobby.Models;

public class LobbyMessage
{
    public int Id { get; set; }
    public string? Message { get; set; }
    public DateTime Time { get; set; }
    public LobbyUser? User { get; set; }
    public bool Deleted { get; set; }
    public string? DeletedBy { get; set; }
}