namespace Throneteki.Lobby.Redis;

public interface IRedisCommandHandler<T>
{
    Task Handle(T message);
}