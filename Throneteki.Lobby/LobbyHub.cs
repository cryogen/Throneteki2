using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Throneteki.Lobby.Models;
using Throneteki.Lobby.Services;

namespace Throneteki.Lobby;

public class LobbyHub : Hub
{
    private readonly LobbyService _lobbyService;

    public LobbyHub(LobbyService lobbyService)
    {
        _lobbyService = lobbyService;
    }

    public override async Task OnConnectedAsync()
    {
        await _lobbyService.UserConnected(Context);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await _lobbyService.UserDisconnected(Context);
        await base.OnDisconnectedAsync(exception);
    }

    public async Task Ping()
    {
        await Clients.Caller.SendAsync(LobbyMethods.Pong);
    }

    [Authorize]
    public Task LobbyChat(string message)
    {
        return _lobbyService.HandleLobbyChat(Context, message);
    }

    [Authorize]
    public Task NewGame(NewGameRequest request)
    {
        return _lobbyService.HandleNewGame(Context, request);
    }

    [Authorize]
    public Task SelectDeck(int deckId)
    {
        return _lobbyService.HandleSelectDeck(Context, deckId);
    }

    [Authorize]
    public Task StartGame(string _)
    {
        return _lobbyService.HandleStartGame(Context);
    }

    [Authorize]
    public Task LeaveGame(string _)
    {
        return _lobbyService.HandleLeaveGame(Context);
    }
}