using Microsoft.AspNetCore.SignalR;

namespace Throneteki.Lobby;

public class LobbyHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        await Clients.All.SendAsync("users", new List<string>());

        await base.OnConnectedAsync();
    }
}