using Microsoft.AspNetCore.SignalR;
using Throneteki.Lobby.Services;
using Throneteki.WebService;

namespace Throneteki.Lobby.Commands.Handlers;

public class RemoveLobbyMessageCommandHandler : ILobbyCommandHandler<RemoveLobbyMessageCommand>
{
    private readonly ThronetekiService.ThronetekiServiceClient _thronetekiClient;
    private readonly LobbyService _lobbyService;

    public RemoveLobbyMessageCommandHandler(ThronetekiService.ThronetekiServiceClient thronetekiClient, LobbyService lobbyService)
    {
        _thronetekiClient = thronetekiClient;
        _lobbyService = lobbyService;
    }

    public async Task HandleAsync(RemoveLobbyMessageCommand command)
    {
        var user = await _thronetekiClient.GetUserByUsernameAsync(new GetUserByUsernameRequest
            { Username = command.Username });

        if (user == null)
        {
            return;
        }

        await _thronetekiClient.RemoveLobbyMessageAsync(new RemoveLobbyMessageRequest
            { DeletedByUserId = user.User.Id, MessageId = command.MessageId });

        await _lobbyService.BroadcastMessageRemoval(command.MessageId, command.Username);
    }
}