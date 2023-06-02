using Throneteki.Lobby.Redis.Commands.Incoming;
using Throneteki.Lobby.Services;

namespace Throneteki.Lobby.Redis.Handlers;

public class GameClosedMessageHandler : IRedisCommandHandler<RedisIncomingMessage<GameClosedMessage>>
{
    private readonly LobbyService _lobbyService;

    public GameClosedMessageHandler(LobbyService lobbyService)
    {
        _lobbyService = lobbyService;
    }

    public Task Handle(RedisIncomingMessage<GameClosedMessage> message)
    {
        return message.Arg == null ? Task.CompletedTask : _lobbyService.CloseGame(message.Arg.Game);
    }
}