using Throneteki.Lobby.Models;
using Throneteki.Lobby.Redis.Commands.Incoming;
using Throneteki.Lobby.Services;

namespace Throneteki.Lobby.Redis.Handlers;

public class HelloMessageHandler : IRedisCommandHandler<RedisIncomingMessage<HelloMessage>>
{
    private readonly GameNodeManager _gameNodeManager;

    public HelloMessageHandler(GameNodeManager gameNodeManager)
    {
        _gameNodeManager = gameNodeManager;
    }

    public Task Handle(RedisIncomingMessage<HelloMessage> message)
    {
        var node = new LobbyNode
        {
            Name = message.Source,
            Url = message.Arg.Url,
            MaxGames = message.Arg.MaxGames,
            Version = message.Arg.Version
        };

        _gameNodeManager.AddNode(node);

        return Task.CompletedTask;
    }
}