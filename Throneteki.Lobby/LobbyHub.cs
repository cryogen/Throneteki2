using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;
using Throneteki.WebService;

namespace Throneteki.Lobby;

public class LobbyHub : Hub
{
    private readonly ILogger<LobbyHub> logger;
    private readonly UserServiceFactory userServiceFactory;

    private static readonly ConcurrentDictionary<string, ThronetekiUser> UsersByName = new();
    private static readonly ConcurrentDictionary<string, string> ConnectionsByUsername = new();
    private static readonly ConcurrentDictionary<string, string> Connections = new();

    public LobbyHub(ILogger<LobbyHub> logger, UserServiceFactory userServiceFactory)
    {
        this.logger = logger;
        this.userServiceFactory = userServiceFactory;
    }

    public override async Task OnConnectedAsync()
    {
        Connections[Context.ConnectionId] = Context.ConnectionId;

        var userService = await userServiceFactory.GetUserServiceClient();
        if (userService == null)
        {
            throw new ApplicationException("No user service");
        }

        ThronetekiUser? user = null;
        if (Context.User?.Identity?.IsAuthenticated == true)
        {
            user = (await userService.GetUserByUsernameAsync(
                new GetUserByUsernameRequest
                {
                    Username = Context.User.Identity.Name
                }, cancellationToken: Context.ConnectionAborted)).User;

            UsersByName[user.Username] = user;
            ConnectionsByUsername[user.Username] = Context.ConnectionId;

            logger.LogDebug("Authenticated user connected");
        }

        var userSummaries = (user != null ? FilterUserListForUserByBlockList(user, UsersByName.Values) : UsersByName.Values).Select(u => new
        {
            u.Id,
            u.Avatar,
            u.Username
        });
        await Clients.Caller.SendAsync("users", userSummaries, Context.ConnectionAborted);

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
            var userService = await userServiceFactory.GetUserServiceClient();
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

    private IEnumerable<ThronetekiUser> FilterUserListForUserByBlockList(ThronetekiUser sourceUser, IEnumerable<ThronetekiUser> userList)
    {
        return userList.Where(u =>
            !u.BlockList.Any(bl => bl.UserId == sourceUser.Id) &&
            !sourceUser.BlockList.Any(bl => bl.UserId == u.Id));
    }
}