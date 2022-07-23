using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Throneteki.Lobby;

public class LobbyHub : Hub
{
    private readonly ILogger<LobbyHub> logger;

    public LobbyHub(ILogger<LobbyHub> logger)
    {
        this.logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        await Clients.Caller.SendAsync("users", new List<string>());

        if (Context.User?.Identity?.IsAuthenticated == true)
        {
            logger.LogDebug("Authenticated user connected");
        }

        await base.OnConnectedAsync();
    }
}