namespace Throneteki.Lobby.Redis;

public class RedisCommandHandlerFactory
{
    private readonly IServiceProvider _serviceProvider;

    public RedisCommandHandlerFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public IRedisCommandHandler<T>? GetHandler<T>()
    {
        return _serviceProvider.GetService<IRedisCommandHandler<T>>();
    }
}