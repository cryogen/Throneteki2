using System.Collections.Concurrent;
using System.Diagnostics.CodeAnalysis;
using AutoMapper;
using Google.Protobuf.WellKnownTypes;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using Throneteki.DeckValidation;
using Throneteki.Lobby.Models;
using Throneteki.Models.Models;
using Throneteki.Models.Services;
using Throneteki.WebService;
using LobbyMessage = Throneteki.Lobby.Models.LobbyMessage;

namespace Throneteki.Lobby.Services;

public class LobbyService
{
    private readonly ThronetekiService.ThronetekiServiceClient _thronetekiService;
    private readonly IHubContext<LobbyHub> _hubContext;
    private readonly CardService _cardService;
    private readonly IMapper _mapper;
    private readonly GameNodeManager _nodeManager;
    private readonly ILogger<LobbyService> _logger;
    private readonly LobbyOptions _lobbyOptions;

    private static readonly ConcurrentDictionary<string, ThronetekiUser> UsersByName = new();
    private static readonly ConcurrentDictionary<string, string> ConnectionsByUsername = new();
    private static readonly ConcurrentDictionary<string, string> Connections = new();
    private static readonly ConcurrentDictionary<string, LobbyGame> GamesByUsername = new();
    private static readonly ConcurrentDictionary<Guid, LobbyGame> GamesById = new();

    public LobbyService(ThronetekiService.ThronetekiServiceClient thronetekiService, IHubContext<LobbyHub> hubContext,
        CardService cardService, IMapper mapper, GameNodeManager nodeManager, ILogger<LobbyService>? logger, IOptions<LobbyOptions> lobbyOptions)
    {
        _thronetekiService = thronetekiService;
        _hubContext = hubContext;
        _cardService = cardService;
        _mapper = mapper;
        _nodeManager = nodeManager;
        _logger = logger;
        _lobbyOptions = lobbyOptions.Value;
    }

    public async Task UserConnected(HubCallerContext context)
    {
        Connections[context.ConnectionId] = context.ConnectionId;

        ThronetekiUser? user = null;
        if (context.User?.Identity?.IsAuthenticated == true)
        {
            user = (await _thronetekiService.GetUserByUsernameAsync(
                new GetUserByUsernameRequest
                {
                    Username = context.User.Identity.Name
                }, cancellationToken: context.ConnectionAborted)).User;

            UsersByName[user.Username] = user;
            ConnectionsByUsername[user.Username] = context.ConnectionId;
        }

        var userSummaries = (user != null ? FilterUserListForUserByBlockList(user, UsersByName.Values) : UsersByName.Values).Select(u => new
        {
            u.Id,
            u.Avatar,
            u.Role,
            u.Username
        });

        await _hubContext.Clients.Client(context.ConnectionId).SendAsync(LobbyMethods.Users, userSummaries, context.ConnectionAborted);
        var lobbyMessages = await _thronetekiService.GetLobbyMessagesForUserAsync(
            new GetLobbyMessagesForUserRequest { UserId = user != null ? user.Id : string.Empty },
            cancellationToken: context.ConnectionAborted);
        await _hubContext.Clients.Client(context.ConnectionId).SendAsync(LobbyMethods.LobbyMessages, lobbyMessages.Messages.OrderBy(m => m.Time).Select(message => new LobbyMessage
        {
            Id = message.Id,
            Message = message.Message,
            Time = message.Time.ToDateTime(),
            User = new LobbyUser
            {
                Id = message.User.Id,
                Role = message.User.Role,
                Username = message.User.Username,
                Avatar = message.User.Avatar
            }
        }), cancellationToken: context.ConnectionAborted);

        if (user != null)
        {
            var excludedConnectionIds = new List<string> { context.ConnectionId };

            excludedConnectionIds.AddRange(UsersByName.Values.Where(u =>
                u.BlockList.Any(bl => bl.UserId == user.Id) &&
                user.BlockList.Any(bl => bl.UserId == u.Id)).Select(u => Connections[ConnectionsByUsername[u.Username]]));

            await _hubContext.Clients.AllExcept(excludedConnectionIds).SendAsync(LobbyMethods.NewUser, new LobbyUser
            {
                Id = user.Id,
                Avatar = user.Avatar,
                Username = user.Username
            }, cancellationToken: context.ConnectionAborted);

            if (GamesByUsername.TryGetValue(user.Username, out var game) && game.IsStarted)
            {
                await _hubContext.Clients.Client(context.ConnectionId).SendAsync(LobbyMethods.HandOff, new
                {
                    url = game.Node.Url,
                    name = game.Node.Name,
                    gameId = game.Id.ToString()
                }, cancellationToken: context.ConnectionAborted);
            }
        }
    }

    public async Task UserDisconnected(HubCallerContext context)
    {
        Connections.TryRemove(context.ConnectionId, out _);

        if (context.User?.Identity is { IsAuthenticated: true, Name: not null })
        {
            var user = (await _thronetekiService.GetUserByUsernameAsync(
                new GetUserByUsernameRequest
                {
                    Username = context.User.Identity.Name
                }, cancellationToken: context.ConnectionAborted)).User;

            ConnectionsByUsername.TryRemove(context.User.Identity.Name, out _);
            UsersByName.TryRemove(context.User.Identity.Name, out _);

            var excludedConnectionIds = new List<string> { context.ConnectionId };

            excludedConnectionIds.AddRange(UsersByName.Values.Where(u =>
                u.BlockList.Any(bl => bl.UserId == user.Id) &&
                user.BlockList.Any(bl => bl.UserId == u.Id)).Select(u => Connections[ConnectionsByUsername[u.Username]]));

            await _hubContext.Clients.AllExcept(excludedConnectionIds).SendAsync(LobbyMethods.UserLeft, user.Username,
                cancellationToken: context.ConnectionAborted);

            if (GamesByUsername.TryGetValue(user.Username, out var game))
            {
                game.UserDisconnect(user.Username);
            }
        }
    }

    public async Task HandleLobbyChat(HubCallerContext context, string message)
    {
        var user = (await _thronetekiService.GetUserByUsernameAsync(
            new GetUserByUsernameRequest
            {
                Username = context.User!.Identity!.Name
            })).User;

        if ((DateTime.UtcNow - user.Registered.ToDateTime()).TotalSeconds < _lobbyOptions.MinLobbyChatTime)
        {
            await _hubContext.Clients.Client(context.ConnectionId).SendAsync(LobbyMethods.NoChat);
        }

        var response = await _thronetekiService.AddLobbyMessageAsync(new AddLobbyMessageRequest
        {
            Message = message[..Math.Min(512, message.Length)],
            UserId = user.Id
        });

        if (response?.Message == null)
        {
            _logger.LogError("Error adding lobby message");
            return;
        }

        var newMessage = new LobbyMessage
        {
            Id = response.Message.Id,
            Message = response.Message.Message,
            Time = response.Message.Time.ToDateTime(),
            User = new LobbyUser
            {
                Id = user.Id,
                Avatar = user.Avatar,
                Username = user.Username,
                Role = response.Message.User.Role
            }
        };

        var excludedConnectionIds = new List<string>();

        excludedConnectionIds.AddRange(UsersByName.Values.Where(u =>
            u.BlockList.Any(bl => bl.UserId == user.Id) &&
            user.BlockList.Any(bl => bl.UserId == u.Id)).Select(u => Connections[ConnectionsByUsername[u.Username]]));

        await _hubContext.Clients.AllExcept(excludedConnectionIds).SendAsync(LobbyMethods.LobbyChat, newMessage);
    }

    public async Task HandleNewGame(HubCallerContext context, NewGameRequest request)
    {
        var user = (await _thronetekiService.GetUserByUsernameAsync(
            new GetUserByUsernameRequest
            {
                Username = context.User!.Identity!.Name
            }, cancellationToken: context.ConnectionAborted)).User;

        // Check for existing game
        // Check for quickjoin

        var restrictedLists = await _cardService.GetRestrictedLists();

        var restrictedList = request.RestrictedListId == null ? restrictedLists.First() : restrictedLists.FirstOrDefault(r => r.Id == request.RestrictedListId);

        var newGame = new LobbyGame(request, user, restrictedList);

        newGame.AddUser(new LobbyGamePlayer { User = user }, GameUserType.Player);

        GamesById[newGame.Id] = newGame;
        GamesByUsername[user.Username] = newGame;

        await BroadcastGameMessage(LobbyMethods.NewGame, newGame, context.ConnectionAborted);

        await _hubContext.Groups.AddToGroupAsync(context.ConnectionId, newGame.Id.ToString(), cancellationToken: context.ConnectionAborted);
        await SendGameState(newGame, context.ConnectionAborted);
    }

    public async Task HandleSelectDeck(HubCallerContext context, int deckId)
    {
        var user = (await _thronetekiService.GetUserByUsernameAsync(
            new GetUserByUsernameRequest
            {
                Username = context.User!.Identity!.Name
            }, cancellationToken: context.ConnectionAborted)).User;

        if (!GamesByUsername.ContainsKey(user.Username))
        {
            return;
        }

        var deck = (await _thronetekiService.GetDeckByIdAsync(new GetDeckByIdRequest { DeckId = deckId },
            cancellationToken: context.ConnectionAborted)).Deck;
        if (deck == null)
        {
            return;
        }

        var lobbyDeck = _mapper.Map<LobbyDeck>(deck);

        var game = GamesByUsername[user.Username];

        var packs = _mapper.Map<IEnumerable<LobbyPack>>(
            (await _thronetekiService.GetAllPacksAsync(new GetAllPacksRequest(),
                cancellationToken: context.ConnectionAborted)).Packs);

        var deckValidator = new DeckValidator(packs,
            game.RestrictedList != null ? new[] { game.RestrictedList } : Array.Empty<LobbyRestrictedList>());

        lobbyDeck.ValidationStatus = deckValidator.ValidateDeck(lobbyDeck);
        game.SelectDeck(user.Username, lobbyDeck);

        await SendGameState(game, context.ConnectionAborted);
    }

    public async Task HandleStartGame(HubCallerContext context)
    {
        var user = (await _thronetekiService.GetUserByUsernameAsync(
            new GetUserByUsernameRequest
            {
                Username = context.User!.Identity!.Name
            }, cancellationToken: context.ConnectionAborted)).User;

        if (!GamesByUsername.ContainsKey(user.Username))
        {
            return;
        }

        var game = GamesByUsername[user.Username];
        if (game.Owner != user.Username || !game.Players.All(p => p.User.DeckSelected))
        {
            return;
        }

        var node = _nodeManager.GetNextAvailableNode();
        if (node == null)
        {
            await _hubContext.Clients.Client(context.ConnectionId).SendAsync(LobbyMethods.GameError, "No game nodes available. Try again later.");
            return;
        }

        game.IsStarted = true;
        game.Node = node;

        await BroadcastGameMessage(LobbyMethods.UpdateGame, game, context.ConnectionAborted);
        await _nodeManager.StartGame(node, game.GetStartGameDetails());

        var gameState = game.GetSaveState();

        await _thronetekiService.CreateGameAsync(new CreateGameRequest
        {
            Game = new ThronetekiGame
            {
                Id = gameState.SavedGameId,
                GameId = gameState.GameId.ToString(),
                StartedAt = gameState.StartedAt.ToTimestamp(),
                FinishedAt = gameState.FinishedAt.HasValue
                    ? gameState.FinishedAt.Value.ToTimestamp()
                    : new Timestamp { Nanos = 0, Seconds = 0 },
                WinReason = gameState.WinReason ?? string.Empty,
                Winner = gameState.Winner ?? string.Empty,
                Players =
                {
                    gameState.Players.Select(p => new ThronetekiGamePlayer
                    {
                        Player = p.Name,
                        AgendaCode = p.Agenda ?? string.Empty,
                        FactionCode = p.Faction,
                        TotalPower = p.Power
                    })
                }
            }
        }, cancellationToken: context.ConnectionAborted);

        await _hubContext.Clients.Group(game.Id.ToString()).SendAsync(LobbyMethods.HandOff, new
        {
            url = node.Url,
            name = node.Name,
            gameId = game.Id.ToString()
        }, cancellationToken: context.ConnectionAborted);
    }

    public async Task HandleLeaveGame(HubCallerContext context)
    {
        var user = (await _thronetekiService.GetUserByUsernameAsync(
            new GetUserByUsernameRequest
            {
                Username = context.User!.Identity!.Name
            }, cancellationToken: context.ConnectionAborted)).User;

        if (!GamesByUsername.ContainsKey(user.Username))
        {
            return;
        }

        var game = GamesByUsername[user.Username];

        game.PlayerLeave(user.Username);

        await _hubContext.Clients.Client(context.ConnectionId)
            .SendAsync(LobbyMethods.ClearGameState, cancellationToken: context.ConnectionAborted);

        await _hubContext.Groups.RemoveFromGroupAsync(context.ConnectionId, game.Id.ToString());

        if (game.IsEmpty)
        {
            await BroadcastGameMessage(LobbyMethods.RemoveGame, game, cancellationToken: context.ConnectionAborted);
        }
        else
        {
            await BroadcastGameMessage(LobbyMethods.UpdateGame, game, cancellationToken: context.ConnectionAborted);
        }
    }

    public async Task CloseGame(Guid gameId)
    {
        if (!GamesById.ContainsKey(gameId))
        {
            return;
        }

        var game = GamesById[gameId];

        GamesById.Remove(gameId, out _);

        await BroadcastGameMessage(LobbyMethods.RemoveGame, game);
    }

    private async Task BroadcastGameMessage(string message, LobbyGame game, CancellationToken cancellationToken = default)
    {
        var gameState = game.GetState(null);

        await _hubContext.Clients.AllExcept(ConnectionsByUsername.Values).SendAsync(message, gameState, cancellationToken: cancellationToken);

        var connectionsToSend = new List<string>();

        foreach (var (username, connection) in ConnectionsByUsername)
        {
            var user = UsersByName[username];

            if (!game.IsVisibleFor(user))
            {
                return;
            }

            connectionsToSend.Add(connection);
        }

        await _hubContext.Clients.Clients(connectionsToSend).SendAsync(message, gameState, cancellationToken: cancellationToken);
    }

    private async Task SendGameState(LobbyGame game, CancellationToken cancellationToken = default)
    {
        if (game.IsStarted)
        {
            return;
        }

        foreach (var player in game.GameUsers)
        {
            if (!ConnectionsByUsername.ContainsKey(player.User.Name))
            {
                _logger.LogError("Trying to send game state to {playerName} but they're disconnected", player.User.Name);
                continue;
            }

            var connection = ConnectionsByUsername[player.User.Name];
            await _hubContext.Clients.Client(connection).SendAsync(LobbyMethods.GameState, game.GetState(player.User), cancellationToken: cancellationToken);
        }
    }

    [SuppressMessage("ReSharper", "SimplifyLinqExpressionUseAll", Justification = "More readable this way")]
    private static IEnumerable<ThronetekiUser> FilterUserListForUserByBlockList(ThronetekiUser sourceUser, IEnumerable<ThronetekiUser> userList)
    {
        return userList.Where(u =>
            !u.BlockList.Any(bl => bl.UserId == sourceUser.Id) &&
            !sourceUser.BlockList.Any(bl => bl.UserId == u.Id));
    }
}
