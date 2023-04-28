namespace Throneteki.Lobby.Redis;

public class RedisCommandHandlerFactory
{
    private readonly IServiceProvider serviceProvider;

    public RedisCommandHandlerFactory(IServiceProvider serviceProvider)
    {
        this.serviceProvider = serviceProvider;
    }

    public IRedisCommandHandler<T>? GetHandler<T>()
    {
        return serviceProvider.GetService<IRedisCommandHandler<T>>();
    }
}