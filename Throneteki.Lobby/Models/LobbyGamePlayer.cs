using Throneteki.WebService;

namespace Throneteki.Lobby.Models;

public class LobbyGamePlayer
{
    private readonly ThronetekiUser user;
    private LobbyDeck? selectedDeck;

    public LobbyGamePlayer(ThronetekiUser user)
    {
        this.user = user;
    }

    public string Avatar => user.Avatar;
    public bool DeckSelected => selectedDeck != null;
    public string Name => user.Username;
    public string Role => user.Role;

    public object GetSummary(LobbyGamePlayer? player = null)
    {
        return new
        {
            Avatar,
            DeckSelected,
            Name,
            Role
        };
    }

    public object GetDetails()
    {
        return new
        {
            Avatar,
            Deck = selectedDeck,
            Name,
            Role,
            user.Settings
        };
    }

    public void SelectDeck(LobbyDeck deck)
    {
        selectedDeck = deck;
    }
}