using System.Text.Json;
using StackExchange.Redis;
using Throneteki.Lobby.Models;
using Throneteki.Lobby.Redis;
using Throneteki.Lobby.Redis.Commands.Incoming;
using Throneteki.Lobby.Redis.Commands.Outgoing;

namespace Throneteki.Lobby.Services;

public class GameNodeManager
{
    private readonly RedisCommandHandlerFactory _commandHandlerFactory;

    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly ILogger<GameNodeManager> _logger;
    private readonly ISubscriber _publisher;

    public GameNodeManager(ILogger<GameNodeManager> logger,
        IConnectionMultiplexer connectionMultiplexer,
        RedisCommandHandlerFactory commandHandlerFactory)
    {
        _logger = logger;
        _commandHandlerFactory = commandHandlerFactory;

        _publisher = connectionMultiplexer.GetSubscriber();
        var subscriber = connectionMultiplexer.GetSubscriber();

        subscriber.SubscribeAsync(RedisChannel.Literal(LobbyCommands.Hello), HandleMessage<RedisIncomingMessage<HelloMessage>, HelloMessage>);
        subscriber.SubscribeAsync(RedisChannel.Literal(LobbyCommands.GameWin),
            HandleMessage<RedisIncomingMessage<GameWonMessage>, GameWonMessage>);
        subscriber.SubscribeAsync(RedisChannel.Literal(LobbyCommands.GameClosed),
            HandleMessage<RedisIncomingMessage<GameClosedMessage>, GameClosedMessage>);
        subscriber.SubscribeAsync(RedisChannel.Literal(LobbyCommands.Pong), HandleMessage<RedisIncomingMessage<PongMessage>, PongMessage>);
    }

    public Dictionary<string, LobbyNode> GameNodes { get; } = new();

    public void AddNode(LobbyNode node)
    {
        if (GameNodes.TryGetValue(node.Name, out var gameNode))
        {
            _logger.LogWarning("Got HELLO for node we already know about ({nodeName}), presuming reconnected", node.Name);
            gameNode.IsDisconnected = false;
            gameNode.LastPingSentTime = null;
            gameNode.LastMessageReceivedTime = DateTime.UtcNow;
        }
        else
        {
            GameNodes.Add(node.Name, node);
        }
    }

    public LobbyNode? GetNextAvailableNode()
    {
        return GameNodes.Values.Where(n => !n.IsDisconnected && (n.MaxGames == 0 || n.Games.Count < n.MaxGames))
            .MinBy(n => n.Games.Count);
    }

    public async Task Initialise()
    {
        await SendMessage(LobbyCommands.LobbyHello, new LobbyHello());
    }

    public Task StartGame(LobbyNode node, object gameDetails)
    {
        return SendMessage(LobbyCommands.StartGame, gameDetails, node.Name);
    }

    public Task PingNode(LobbyNode node)
    {
        return SendMessage(LobbyCommands.Ping, new LobbyPing(), node.Name);
    }

    private async Task SendMessage<T>(string command, T message, string target = "allnodes")
    {
        var outgoingMessage = new RedisOutgoingMessage<T>
        {
            Target = target,
            Arg = message
        };

        var messageString = JsonSerializer.Serialize(outgoingMessage, _jsonOptions);

        await _publisher.PublishAsync(RedisChannel.Literal(command), messageString);
    }

    private void HandleMessage<TOuter, TInner>(RedisChannel channel, RedisValue message)
        where TOuter : RedisIncomingMessage<TInner>, new()
    {
        var handler = _commandHandlerFactory.GetHandler<TOuter>();
        if (handler == null)
        {
            throw new InvalidOperationException($"Unknown redis command: '{channel}'");
        }

        var param = new TOuter();

        if (message != RedisValue.Null)
        {
            param = JsonSerializer.Deserialize<TOuter>(message!, _jsonOptions);
        }

        if (GameNodes.TryGetValue(param!.Source, out var node))
        {
            node.LastMessageReceivedTime = DateTime.UtcNow;
            node.LastPingSentTime = null;
        }

        handler.Handle(param);
    }
}