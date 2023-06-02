using System.Text.Json;
using StackExchange.Redis;
using Throneteki.Lobby.Models;
using Throneteki.Lobby.Redis;
using Throneteki.Lobby.Redis.Commands.Incoming;
using Throneteki.Lobby.Redis.Commands.Outgoing;

namespace Throneteki.Lobby.Services;

public class GameNodeManager
{
    private readonly ILogger<GameNodeManager> _logger;
    private readonly RedisCommandHandlerFactory _commandHandlerFactory;
    private readonly Dictionary<string, LobbyNode> _gameNodes = new();
    private readonly IDatabase _database;
    private readonly ISubscriber _publisher;

    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public GameNodeManager(ILogger<GameNodeManager> logger, IConnectionMultiplexer connectionMultiplexer, RedisCommandHandlerFactory commandHandlerFactory)
    {
        _logger = logger;
        _commandHandlerFactory = commandHandlerFactory;

        _database = connectionMultiplexer.GetDatabase();
        _publisher = connectionMultiplexer.GetSubscriber();
        var subscriber = connectionMultiplexer.GetSubscriber();

        subscriber.SubscribeAsync(LobbyCommands.Hello, HandleMessage<RedisIncomingMessage<HelloMessage>>);
        subscriber.SubscribeAsync(LobbyCommands.GameWin, HandleMessage<RedisIncomingMessage<GameWonMessage>>);
        subscriber.SubscribeAsync(LobbyCommands.GameClosed, HandleMessage<RedisIncomingMessage<GameClosedMessage>>);
    }

    public void AddNode(LobbyNode node)
    {
        if (_gameNodes.ContainsKey(node.Name))
        {
            _logger.LogWarning($"Got HELLO for node we already know about ({node.Name}), presuming reconnected");
        }
        else
        {
            _gameNodes.Add(node.Name, node);
        }
    }

    public LobbyNode? GetNextAvailableNode()
    {
        return _gameNodes.Values.Where(n => n.MaxGames == 0 || n.Games.Count < n.MaxGames).MinBy(n => n.Games.Count);
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

        var messageString = JsonSerializer.Serialize(outgoingMessage, _jsonOptions);

        await _publisher.PublishAsync(command, messageString);
    }

    private void HandleMessage<T>(RedisChannel channel, RedisValue message) where T : class, new()
    {
        var handler = _commandHandlerFactory.GetHandler<T>();
        if (handler == null)
        {
            throw new InvalidOperationException($"Unknown redis command: '{channel}'");
        }

        var param = new T();

        if (message != RedisValue.Null)
        {
            param = JsonSerializer.Deserialize<T>(message!, _jsonOptions);
        }

        handler.Handle(param!);
    }
}