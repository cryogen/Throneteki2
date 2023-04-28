using System.Text.Json;
using StackExchange.Redis;
using Throneteki.Lobby.Models;
using Throneteki.Lobby.Redis;
using Throneteki.Lobby.Redis.Commands.Incoming;
using Throneteki.Lobby.Redis.Commands.Outgoing;

namespace Throneteki.Lobby.Services;

public class GameNodesService
{
    private readonly RedisCommandHandlerFactory commandHandlerFactory;
    private readonly IDatabase database;
    private readonly ISubscriber publisher;

    private readonly JsonSerializerOptions jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public GameNodesService(IConnectionMultiplexer connectionMultiplexer,
        RedisCommandHandlerFactory commandHandlerFactory)
    {
        this.commandHandlerFactory = commandHandlerFactory;
        database = connectionMultiplexer.GetDatabase();
        publisher = connectionMultiplexer.GetSubscriber();
        var subscriber = connectionMultiplexer.GetSubscriber();

        subscriber.SubscribeAsync(LobbyCommands.Hello, HandleMessage<RedisIncomingMessage<HelloMessage>>);
    }

    public async Task Initialise()
    {
        await SendMessage(LobbyCommands.LobbyHello, new LobbyHello());
    }

    public Task StartGame(LobbyNode node, object gameDetails)
    {
        return SendMessage(LobbyCommands.StartGame, gameDetails, node.Name);
    }

    private async Task SendMessage<T>(string command, T message, string target = "allnodes")
    {
        var outgoingMessage = new RedisOutgoingMessage<T>
        {
            Target = target,
            Arg = message
        };

        var messageString = JsonSerializer.Serialize(outgoingMessage, jsonOptions);

        await publisher.PublishAsync(command, messageString);
    }

    private void HandleMessage<T>(RedisChannel channel, RedisValue message) where T : class, new()
    {
        var handler = commandHandlerFactory.GetHandler<T>();
        if (handler == null)
        {
            throw new InvalidOperationException($"Unknown redis command: '{channel}'");
        }

        var param = new T();

        if (message != RedisValue.Null)
        {
            param = JsonSerializer.Deserialize<T>(message!, jsonOptions);
        }

        handler.Handle(param!);
    }
}