using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using Throneteki.WebService;

namespace Throneteki.Lobby.Models;

public class LobbyGame
{
    private readonly ConcurrentDictionary<string, GameUser> gameUsers = new();

    public LobbyGame(NewGameRequest request, ThronetekiUser owner)
    {
        AllowSpectators = request.AllowSpectators;
        IsPrivate = request.GamePrivate;
        Name = request.Name;
        Password = string.IsNullOrEmpty(request.Password) ? null : HashPassword(request.Password);
        Owner = owner.Username;
        GameType = request.GameType;
        ShowHand = request.ShowHands;
        IsGameTimeLimited = request.UseGameTimeLimit;
    }

    public bool AllowSpectators { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string GameType { get; set; }
    public ICollection<GameUser> GameUsers => gameUsers.Values;
    public ICollection<GameUser> Players => gameUsers.Values.Where(gu => gu.GameUserType == GameUserType.Player).ToList();
    public Guid Id { get; set; } = Guid.NewGuid();
    public bool IsChessClocksEnabled { get; set; }
    public bool IsGameTimeLimited { get; set; }
    public bool IsPrivate { get; set; }
    public bool IsStarted { get; set; }
    public string? Name { get; set; }
    public string Owner { get; set; }
    public string? Password { get; set; }
    public bool ShowHand { get; set; }
    public bool IsEmpty => !Players.Any();

    public void AddUser(LobbyGamePlayer user, GameUserType userType)
    {
        gameUsers[user.Name] = new GameUser { GameUserType = userType, User = user };
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();

        var secretBytes = Encoding.UTF8.GetBytes(password);
        var secretHash = sha256.ComputeHash(secretBytes);

        return Convert.ToHexString(secretHash);
    }

    public object GetState(LobbyGamePlayer? player)
    {
        /*
        var playerSummaries = {};
        var playersInGame = _.filter(this.players, player => !player.left);

        _.each(playersInGame, player => {
            var deck = undefined;

            if(activePlayer === player.name && player.deck) {
                deck = { name: player.deck.name, selected: player.deck.selected, status: player.deck.status };
            } else if(player.deck) {
                deck = { selected: player.deck.selected, status: player.deck.status };
            } else {
                deck = {};
            }

            playerSummaries[player.name] = {
                agenda: this.started && player.agenda ? player.agenda.cardData.code : undefined,
                deck: activePlayer ? deck : {},
                faction: this.started && player.faction ? player.faction.cardData.code : undefined,
                id: player.id,
                left: player.left,
                name: player.name,
                owner: player.owner,
                role: player.user.role,
                settings: player.user.settings
            };
        });

        return {
            allowSpectators: this.allowSpectators,
            createdAt: this.createdAt,
            gamePrivate: this.gamePrivate,
            gameType: this.gameType,
            event: this.event,
            full: Object.values(this.players).length >= this.maxPlayers,
            id: this.id,
            messages: activePlayer ? this.gameChat.messages : undefined,
            name: this.name,
            needsPassword: !!this.password,
            node: this.node ? this.node.identity : undefined,
            owner: this.owner.username,
            players: playerSummaries,
            restrictedList: this.restrictedList,
            showHand: this.showHand,
            started: this.started,
            spectators: _.map(this.spectators, spectator => {
                return {
                    id: spectator.id,
                    name: spectator.name,
                    settings: spectator.settings
                };
            }),
            useGameTimeLimit: this.useGameTimeLimit,
            gameTimeLimit: this.gameTimeLimit,
            muteSpectators: this.muteSpectators,
            useChessClocks: this.useChessClocks,
            chessClockTimeLimit: this.chessClockTimeLimit
        };
        */

        return new
        {
            AllowSpectators,
            CreatedAt,
            GamePrivate = IsPrivate,
            GameType,
            Id,
            Name,
            NeedsPassword = !string.IsNullOrEmpty(Password),
            Owner,
            Players = GameUsers.Where(gu => gu.GameUserType == GameUserType.Player).Select(gu => gu.User.GetSummary(player)),
            ShowHand,
            Spectators = GameUsers.Where(gu => gu.GameUserType == GameUserType.Spectator).Select(gu => gu.User.GetSummary()),
            Started = IsStarted,
            UseChessClocks = IsChessClocksEnabled,
            UseGameTimeLimit = IsGameTimeLimited
        };
    }

    public object GetStartGameDetails()
    {
        return new
        {
            AllowSpectators,
            CreatedAt,
            //event: this.event,
            GamePrivate = IsPrivate,
            GameType,
            Id,
            Name,
//            isMelee: this.isMelee,
            Owner,
            Players = GameUsers.Where(gu => gu.GameUserType == GameUserType.Player).Select(gu => gu.User.GetDetails()),
            //            restrictedList: this.restrictedList,
            ShowHand,
            Spectators = GameUsers.Where(gu => gu.GameUserType == GameUserType.Spectator).Select(gu => gu.User.GetDetails()),
            //useRookery: this.useRookery,
            UseChessClocks = IsChessClocksEnabled,
            UseGameTimeLimit = IsGameTimeLimited
            //       gameTimeLimit: this.gameTimeLimit,
            //         muteSpectators: this.muteSpectators,
//            chessClockTimeLimit: this.chessClockTimeLimit
        };
    }

    public bool IsVisibleFor(ThronetekiUser user)
    {
        return true;
    }

    public void SelectDeck(string username, LobbyDeck deck)
    {
        var player = gameUsers[username];

        player.User.SelectDeck(deck);
    }

    public void UserDisconnect(string username)
    {
        if (IsStarted || !gameUsers.ContainsKey(username))
        {
            return;
        }

        AddMessage($"{username} has disconnected.");

        var user = gameUsers[username];

        if (user.GameUserType == GameUserType.Player)
        {
            if (Owner == username)
            {
                var otherPlayer = GameUsers
                    .FirstOrDefault(gu => gu.GameUserType == GameUserType.Player && gu.User.Name != username);

                if (otherPlayer != null)
                {
                    Owner = otherPlayer.User.Name;
                }
            }
        }

        gameUsers.Remove(username, out _);
    }

    private void AddMessage(string format, params object[] args)
    {
    }

    public void PlayerLeave(string username)
    {
        var player = gameUsers[username];

        if (!IsStarted)
        {
            AddMessage($"{0} has left the game", player);
        }

        if (player.GameUserType == GameUserType.Player)
        {
            if (IsStarted)
            {
                player.HasLeft = true;
            }
            else
            {
                RemoveAndResetOwner(player);

                gameUsers.Remove(username, out _);
            }
        }
        else
        {
            gameUsers.Remove(username, out _);
        }
    }

    private void RemoveAndResetOwner(GameUser player)
    {
        if (player.Name == Owner)
        {
            var otherPlayer = Players.FirstOrDefault(gu => gu.Name != player.Name);

            if (otherPlayer != null)
            {
                Owner = otherPlayer.Name;
//                otherPlayer.Owner = true;
            }
        }
    }
}