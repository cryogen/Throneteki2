using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;
using Throneteki.WebService;

namespace Throneteki.Lobby;

public class LobbyHub : Hub
{
    private readonly ILogger<LobbyHub> logger;
    private readonly UserServiceFactory userServiceFactory;

    private static readonly ConcurrentDictionary<string, ThronetekiUser> UsersByName = new();

    public LobbyHub(ILogger<LobbyHub> logger, UserServiceFactory userServiceFactory)
    {
        this.logger = logger;
        this.userServiceFactory = userServiceFactory;
    }

    public override async Task OnConnectedAsync()
    {
        var userService = await userServiceFactory.GetUserServiceClient();

        if (userService == null)
        {
            throw new ApplicationException("No user service");
        }

        if (Context.User?.Identity?.IsAuthenticated == true)
        {
            var user = (await userService.GetUserByUsernameAsync(new GetUserByUsernameRequest { Username = Context.User.Identity.Name })).User;

            UsersByName[user.Username] = user;

            logger.LogDebug("Authenticated user connected");
        }

        await Clients.Caller.SendAsync("users", UsersByName.Values);

        await base.OnConnectedAsync();
    }
}