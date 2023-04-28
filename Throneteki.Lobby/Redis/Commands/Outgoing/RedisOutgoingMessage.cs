namespace Throneteki.Lobby.Redis.Commands.Outgoing;

public class RedisOutgoingMessage<T>
{
    public string? Target { get; set; } = "allnodes";
    public T? Arg { get; set; }
}