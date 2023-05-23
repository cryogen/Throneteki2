using Throneteki.Models.Models;
using Throneteki.WebService;

namespace Throneteki.Lobby.Models;

public class LobbyGamePlayer
{
    private readonly ThronetekiUser _user;
    private LobbyDeck? _selectedDeck;

    public LobbyGamePlayer(ThronetekiUser user)
    {
        _user = user;
    }

    public string Avatar => _user.Avatar;
    public bool DeckSelected => _selectedDeck != null;
    public string Name => _user.Username;
    public string Role => _user.Role;

    public object GetSummary(LobbyGamePlayer? player = null)
    {
        return new
        {
            Avatar,
            DeckSelected,
            DeckStatus = _selectedDeck?.ValidationStatus,
            DeckName = player != null && player.Name == _user.Username ? _selectedDeck?.Name : null,
            Name,
            Role
        };
    }

    public object GetDetails()
    {
        return new
        {
            Avatar,
            Deck = _selectedDeck,
            Name,
            Role,
            _user.Settings,
            PromptedActionWindows = _user.Settings.ActionWindows
        };
    }

    public void SelectDeck(LobbyDeck deck)
    {
        _selectedDeck = deck;
    }
}