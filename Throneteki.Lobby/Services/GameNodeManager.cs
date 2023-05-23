using Throneteki.Lobby.Models;

namespace Throneteki.Lobby.Services;

public class GameNodeManager
{
    private readonly ILogger<GameNodeManager> _logger;
    private readonly Dictionary<string, LobbyNode> _gameNodes = new();

    public GameNodeManager(ILogger<GameNodeManager> logger)
    {
        _logger = logger;
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
}