using System.Collections.Concurrent;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Throneteki.WebService;

namespace Throneteki.Lobby;

public class LobbyHub : Hub
{
    private readonly ILogger<LobbyHub> logger;
    private readonly LobbyServiceFactory lobbyServiceFactory;

    private static readonly ConcurrentDictionary<string, ThronetekiUser> UsersByName = new();
    private static readonly ConcurrentDictionary<string, string> ConnectionsByUsername = new();
    private static readonly ConcurrentDictionary<string, string> Connections = new();
    private readonly IConfigurationSection settings;

    public LobbyHub(ILogger<LobbyHub> logger, LobbyServiceFactory lobbyServiceFactory, IConfiguration configuration)
    {
        this.logger = logger;
        this.lobbyServiceFactory = lobbyServiceFactory;
        settings = configuration.GetSection("Settings");
    }

    public override async Task OnConnectedAsync()
    {
        Connections[Context.ConnectionId] = Context.ConnectionId;

        var lobbyService = await lobbyServiceFactory.GetUserServiceClient();
        if (lobbyService == null)
        {
            throw new ApplicationException("No user service");
        }

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
            u.Username
        });
        await Clients.Caller.SendAsync("users", userSummaries, Context.ConnectionAborted);

        var lobbyMessages = await lobbyService.GetLobbyMessagesForUserAsync(new GetLobbyMessagesForUserRequest { UserId = user != null ? user.Id : string.Empty });
        await Clients.Caller.SendAsync("lobbymessages", lobbyMessages.Messages.OrderBy(m => m.Time).Select(message => new
        {
            message.Id,
            message.Message,
            Time = message.Time.ToDateTime(),
            User = new
            {
                message.User.Id,
                message.User.Avatar,
                message.User.Username,
                message.User.Role
            }
        }));

        if (user != null)
        {
            var excludedConnectionIds = new List<string> { Context.ConnectionId };

            excludedConnectionIds.AddRange(UsersByName.Values.Where(u =>
                u.BlockList.Any(bl => bl.UserId == user.Id) &&
                user.BlockList.Any(bl => bl.UserId == u.Id)).Select(u => Connections[ConnectionsByUsername[u.Username]]));

            await Clients.AllExcept(excludedConnectionIds).SendAsync("newuser", new
            {
                user.Id,
                user.Avatar,
                user.Username
            });
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Connections.TryRemove(Context.ConnectionId, out _);

        if (Context.User?.Identity?.IsAuthenticated == true && Context.User.Identity.Name != null)
        {
            var userService = await lobbyServiceFactory.GetUserServiceClient();
            if (userService == null)
            {
                throw new ApplicationException("No user service");
            }

            var user = (await userService.GetUserByUsernameAsync(
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

            await Clients.AllExcept(excludedConnectionIds).SendAsync("userleft", user.Username);
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
        var lobbyService = await lobbyServiceFactory.GetUserServiceClient();
        if (lobbyService == null)
        {
            throw new ApplicationException("No user service");
        }

        var user = (await lobbyService.GetUserByUsernameAsync(
            new GetUserByUsernameRequest
            {
                Username = Context.User!.Identity!.Name
            })).User;

        if ((DateTime.UtcNow - user.Registered.ToDateTime()).TotalSeconds < int.Parse(settings["MinLobbyChatTime"]))
        {
            await Clients.Caller.SendCoreAsync("nochat", new object?[] { });
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

        var newMessage = new
        {
            response.Message.Id,
            response.Message.Message,
            Time = response.Message.Time.ToDateTime(),
            User = new
            {
                user.Id,
                user.Avatar,
                user.Username,
                user.Role
            }
        };

        var excludedConnectionIds = new List<string>();

        excludedConnectionIds.AddRange(UsersByName.Values.Where(u =>
            u.BlockList.Any(bl => bl.UserId == user.Id) &&
            user.BlockList.Any(bl => bl.UserId == u.Id)).Select(u => Connections[ConnectionsByUsername[u.Username]]));

        await Clients.AllExcept(excludedConnectionIds).SendAsync("lobbychat", newMessage);
    }

    private IEnumerable<ThronetekiUser> FilterUserListForUserByBlockList(ThronetekiUser sourceUser, IEnumerable<ThronetekiUser> userList)
    {
        return userList.Where(u =>
            !u.BlockList.Any(bl => bl.UserId == sourceUser.Id) &&
            !sourceUser.BlockList.Any(bl => bl.UserId == u.Id));
    }
}