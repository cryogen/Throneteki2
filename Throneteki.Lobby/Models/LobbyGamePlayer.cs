using Throneteki.Models.Models;
using Throneteki.WebService;

namespace Throneteki.Lobby.Models;

public class LobbyGamePlayer
{
    public string Avatar => User.Avatar;
    public bool DeckSelected => Deck != null;
    public string Name => User.Username;
    public string Role => User.Role;
    public LobbyDeck? Deck { get; set; }
    public ThronetekiUser User { get; set; } = null!;

    public object GetSummary(LobbyGamePlayer? player = null)
    {
        return new
        {
            Avatar,
            DeckSelected,
            DeckStatus = Deck?.ValidationStatus,
            DeckName = player != null && player.Name == User.Username ? Deck?.Name : null,
            Name,
            Role
        };
    }

    public object GetDetails()
    {
        return new
        {
            Avatar,
            Deck,
            Name,
            Role,
            User.Settings,
            PromptedActionWindows = User.Settings.ActionWindows
        };
    }
}