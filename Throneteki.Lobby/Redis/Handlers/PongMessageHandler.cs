using Throneteki.Lobby.Redis.Commands.Incoming;

namespace Throneteki.Lobby.Redis.Handlers;

public class PongMessageHandler : IRedisCommandHandler<RedisIncomingMessage<PongMessage>>
{
    public Task Handle(RedisIncomingMessage<PongMessage> message)
    {
        return Task.CompletedTask;
    }
}