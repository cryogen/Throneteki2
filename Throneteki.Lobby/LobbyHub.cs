
using System.Collections.Concurrent;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Throneteki.DeckValidation;
using Throneteki.Lobby.Models;
using Throneteki.Lobby.Services;
using Throneteki.Models.Services;
using Throneteki.WebService;
using DeckValidationStatus = Throneteki.WebService.DeckValidationStatus;
using LobbyMessage = Throneteki.Lobby.Models.LobbyMessage;
using LobbyPack = Throneteki.Models.Models.LobbyPack;

namespace Throneteki.Lobby;

public class LobbyHub : Hub
{
    private readonly ILogger<LobbyHub> logger;
    private readonly LobbyService.LobbyServiceClient lobbyService;
    private readonly GameNodesService gameNodesService;
    private readonly GameNodeManager nodeManager;
    private readonly IMapper mapper;
    private readonly CardService cardService;

    private static readonly ConcurrentDictionary<string, ThronetekiUser> UsersByName = new();
    private static readonly ConcurrentDictionary<string, string> ConnectionsByUsername = new();
    private static readonly ConcurrentDictionary<string, string> Connections = new();
    private static readonly ConcurrentDictionary<Guid, LobbyGame> GamesById = new();
    private static readonly ConcurrentDictionary<string, LobbyGame> GamesByUsername = new();
    private readonly IConfigurationSection settings;

    public LobbyHub(ILogger<LobbyHub> logger, LobbyService.LobbyServiceClient lobbyServiceClient, IConfiguration configuration, GameNodesService gameNodesService,
        GameNodeManager nodeManager, IMapper mapper, CardService cardService)
    {
        this.logger = logger;
        lobbyService = lobbyServiceClient;
        this.gameNodesService = gameNodesService;
        this.nodeManager = nodeManager;
        this.mapper = mapper;
        this.cardService = cardService;
        settings = configuration.GetSection("Settings");
    }

    public override async Task OnConnectedAsync()
    {
        Connections[Context.ConnectionId] = Context.ConnectionId;

        ThronetekiUser? user = null;
        if (Context.User?.Identity?.IsAuthenticated == true)
        {
            user = (await lobbyService.GetUserByUsernameAsync(
                new GetUserByUsernameRequest
                {
                    Username = Context.User.Identity.Name
                }, cancellationToken: Context.ConnectionAborted)).User;

            UsersByName[user.Username] = user;
            ConnectionsByUsername[user.Username] = Context.ConnectionId;
        }

        var userSummaries = (user != null ? FilterUserListForUserByBlockList(user, UsersByName.Values) : UsersByName.Values).Select(u => new
        {
            u.Id,
            u.Avatar,
            u.Role,
            u.Username
        });
        await Clients.Caller.SendAsync(LobbyMethods.Users, userSummaries, Context.ConnectionAborted);

        var lobbyMessages = await lobbyService.GetLobbyMessagesForUserAsync(new GetLobbyMessagesForUserRequest { UserId = user != null ? user.Id : string.Empty });
        await Clients.Caller.SendAsync(LobbyMethods.LobbyMessages, lobbyMessages.Messages.OrderBy(m => m.Time).Select(message => new LobbyMessage
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
        }));

        if (user != null)
        {
            var excludedConnectionIds = new List<string> { Context.ConnectionId };

            excludedConnectionIds.AddRange(UsersByName.Values.Where(u =>
                u.BlockList.Any(bl => bl.UserId == user.Id) &&
                user.BlockList.Any(bl => bl.UserId == u.Id)).Select(u => Connections[ConnectionsByUsername[u.Username]]));

            await Clients.AllExcept(excludedConnectionIds).SendAsync(LobbyMethods.NewUser, new LobbyUser
            {
                Id = user.Id,
                Avatar = user.Avatar,
                Username = user.Username
            });
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Connections.TryRemove(Context.ConnectionId, out _);

        if (Context.User?.Identity?.IsAuthenticated == true && Context.User.Identity.Name != null)
        {
            var user = (await lobbyService.GetUserByUsernameAsync(
                new GetUserByUsernameRequest
                {
                    Username = Context.User.Identity.Name
                })).User;

            ConnectionsByUsername.TryRemove(Context.User.Identity.Name, out _);
            UsersByName.TryRemove(Context.User.Identity.Name, out _);

            var excludedConnectionIds = new List<string> { Context.ConnectionId };

            excludedConnectionIds.AddRange(UsersByName.Values.Where(u =>
                u.BlockList.Any(bl => bl.UserId == user.Id) &&
                user.BlockList.Any(bl => bl.UserId == u.Id)).Select(u => Connections[ConnectionsByUsername[u.Username]]));

            await Clients.AllExcept(excludedConnectionIds).SendAsync(LobbyMethods.UserLeft, user.Username);

            if (GamesByUsername.ContainsKey(user.Username))
            {
                var game = GamesByUsername[user.Username];

                game.UserDisconnect(user.Username);
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task Ping()
    {
        await Clients.Caller.SendAsync("pong");
    }

    [Authorize]
    public async Task LobbyChat(string message)
    {
        var user = (await lobbyService.GetUserByUsernameAsync(
            new GetUserByUsernameRequest
            {
                Username = Context.User!.Identity!.Name
            })).User;

        if ((DateTime.UtcNow - user.Registered.ToDateTime()).TotalSeconds < int.Parse(settings["MinLobbyChatTime"]))
        {
            await Clients.Caller.SendCoreAsync(LobbyMethods.NoChat, new object?[] { });
        }

        var response = await lobbyService.AddLobbyMessageAsync(new AddLobbyMessageRequest
        {
            Message = message[..Math.Min(512, message.Length)],
            UserId = user.Id
        });

        if (response?.Message == null)
        {
            logger.LogError("Error adding lobby message");
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

        await Clients.AllExcept(excludedConnectionIds).SendAsync(LobbyMethods.LobbyChat, newMessage);
    }

    [Authorize]
    public async Task NewGame(NewGameRequest request)
    {
        var user = (await lobbyService.GetUserByUsernameAsync(
            new GetUserByUsernameRequest
            {
                Username = Context.User!.Identity!.Name
            })).User;

        // Check for existing game
        // Check for quickjoin

        var restrictedLists = await cardService.GetRestrictedLists();

        var restrictedList = request.RestrictedListId == null ? restrictedLists.First() : restrictedLists.FirstOrDefault(r => r.Id == request.RestrictedListId);

        var newGame = new LobbyGame(request, user, restrictedList);

        newGame.AddUser(new LobbyGamePlayer(user), GameUserType.Player);

        GamesById[newGame.Id] = newGame;
        GamesByUsername[user.Username] = newGame;

        await BroadcastGameMessage(LobbyMethods.NewGame, newGame);

        await Groups.AddToGroupAsync(Context.ConnectionId, newGame.Id.ToString());
        await SendGameState(newGame);
    }

    [Authorize]
    public async Task SelectDeck(int deckId)
    {
        var user = (await lobbyService.GetUserByUsernameAsync(
            new GetUserByUsernameRequest
            {
                Username = Context.User!.Identity!.Name
            })).User;

        var deck = (await lobbyService.GetDeckByIdAsync(new GetDeckByIdRequest { DeckId = deckId })).Deck;
        if (deck == null)
        {
            return;
        }

        if (!GamesByUsername.ContainsKey(user.Username))
        {
            return;
        }

        var game = GamesByUsername[user.Username];

        var packs = mapper.Map<IEnumerable<LobbyPack>>((await lobbyService.GetAllPacksAsync(new GetAllPacksRequest())).Packs);

        var deckValidator = new DeckValidator(packs, game.RestrictedList != null ? new[] { game.RestrictedList } : Array.Empty<LobbyRestrictedList>());

        deck.ValidationStatus = mapper.Map<DeckValidationStatus>(deckValidator.ValidateDeck(deck));
        game.SelectDeck(user.Username, deck);

        await SendGameState(game);
    }

    [Authorize]
    public async Task StartGame(string _)
    {
        var user = (await lobbyService.GetUserByUsernameAsync(
        new GetUserByUsernameRequest
        {
            Username = Context.User!.Identity!.Name
        })).User;

        if (!GamesByUsername.ContainsKey(user.Username))
        {
            return;
        }

        var game = GamesByUsername[user.Username];
        if(game.Owner != user.Username || !game.Players.All(p => p.User.DeckSelected))
        {
            return;
        }

        var node = nodeManager.GetNextAvailableNode();
        if (node == null)
        {
            await Clients.Caller.SendAsync(LobbyMethods.GameError, "No game nodes available. Try again later.");
            return;
        }

        game.IsStarted = true;

        await BroadcastGameMessage(LobbyMethods.UpdateGame, game);
        await gameNodesService.StartGame(node, game.GetStartGameDetails());

        await Clients.Group(game.Id.ToString()).SendAsync(LobbyMethods.HandOff, new
        {
            url = node.Url,
            name = node.Name,
            gameId = game.Id.ToString()
        });
    }

    [Authorize]
    public async Task LeaveGame(string _)
    {
        var user = (await lobbyService.GetUserByUsernameAsync(
            new GetUserByUsernameRequest
            {
                Username = Context.User!.Identity!.Name
            })).User;

        if (!GamesByUsername.ContainsKey(user.Username))
        {
            return;
        }

        var game = GamesByUsername[user.Username];

        game.PlayerLeave(user.Username);

        await Clients.Caller.SendAsync(LobbyMethods.ClearGameState);

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, game.Id.ToString());

        if (game.IsEmpty)
        {
            await BroadcastGameMessage(LobbyMethods.RemoveGame, game);
        }
        else
        {
            await BroadcastGameMessage(LobbyMethods.UpdateGame, game);
        }
    }

    private static IEnumerable<ThronetekiUser> FilterUserListForUserByBlockList(ThronetekiUser sourceUser, IEnumerable<ThronetekiUser> userList)
    {
        return userList.Where(u =>
            !u.BlockList.Any(bl => bl.UserId == sourceUser.Id) &&
            !sourceUser.BlockList.Any(bl => bl.UserId == u.Id));
    }

    private async Task BroadcastGameMessage(string message, LobbyGame game)
    {
        var gameState = game.GetState(null);

        await Clients.AllExcept(ConnectionsByUsername.Values).SendAsync(message, gameState);

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

        await Clients.Clients(connectionsToSend).SendAsync(message, gameState);
    }

    private async Task SendGameState(LobbyGame game)
    {
        if (game.IsStarted)
        {
            return;
        }

        foreach (var player in game.GameUsers)
        {
            if (!ConnectionsByUsername.ContainsKey(player.User.Name))
            {
                logger.LogError("Trying to send game state to {playerName} but they're disconnected", player.User.Name);
                continue; 
            }

            var connection = ConnectionsByUsername[player.User.Name];
            await Clients.Client(connection).SendAsync(LobbyMethods.GameState, game.GetState(player.User));
        }
    }
}