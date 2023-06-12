using Quartz;
using Throneteki.Lobby.Services;

namespace Throneteki.Lobby;

public class GameCleanupJob : IJob
{
    private readonly LobbyService _lobbyService;

    public GameCleanupJob(LobbyService lobbyService)
    {
        _lobbyService = lobbyService;
    }

    public Task Execute(IJobExecutionContext context)
    {
        return _lobbyService.ClearStalePendingGames();
    }
}