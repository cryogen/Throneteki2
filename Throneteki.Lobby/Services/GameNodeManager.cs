using Throneteki.Lobby.Models;

namespace Throneteki.Lobby.Services;

public class GameNodeManager
{
    private readonly ILogger<GameNodeManager> logger;
    private readonly Dictionary<string, LobbyNode> gameNodes = new();

    public GameNodeManager(ILogger<GameNodeManager> logger)
    {
        this.logger = logger;
    }

    public void AddNode(LobbyNode node)
    {
        if (gameNodes.ContainsKey(node.Name))
        {
            logger.LogWarning($"Got HELLO for node we already know about ({node.Name}), presuming reconnected");
        }
        else
        {
            gameNodes.Add(node.Name, node);
        }
    }

    public LobbyNode? GetNextAvailableNode()
    {
        return gameNodes.Values.Where(n => n.MaxGames == 0 || n.Games.Count < n.MaxGames).MinBy(n => n.Games.Count);
    }
}