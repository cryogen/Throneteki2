namespace Throneteki.Lobby.Redis.Commands.Incoming;

public class RedisIncomingMessage<T>
{
    public string Source { get; set; } = null!;
    public T? Arg { get; set; }
}