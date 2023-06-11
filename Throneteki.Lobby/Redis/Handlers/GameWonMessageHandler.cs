using Google.Protobuf.WellKnownTypes;
using Throneteki.Lobby.Redis.Commands.Incoming;
using Throneteki.WebService;

namespace Throneteki.Lobby.Redis.Handlers;

public class GameWonMessageHandler : IRedisCommandHandler<RedisIncomingMessage<GameWonMessage>>
{
    private readonly ThronetekiService.ThronetekiServiceClient _thronetekiServiceClient;

    public GameWonMessageHandler(ThronetekiService.ThronetekiServiceClient thronetekiServiceClient)
    {
        _thronetekiServiceClient = thronetekiServiceClient;
    }

    public async Task Handle(RedisIncomingMessage<GameWonMessage> message)
    {
        if (message.Arg?.Game == null)
        {
            return;
        }

        await _thronetekiServiceClient.UpdateGameAsync(new UpdateGameRequest
        {
            Game = new ThronetekiGame
            {
                FinishedAt = message.Arg.Game.FinishedAt.HasValue
                    ? message.Arg.Game.FinishedAt.Value.ToTimestamp()
                    : new Timestamp { Nanos = 0, Seconds = 0 },
                GameId = message.Arg.Game.GameId.ToString(),
                StartedAt = message.Arg.Game.StartedAt.ToTimestamp(),
                WinReason = message.Arg.Reason,
                Winner = message.Arg.Winner,
                Players =
                {
                    message.Arg.Game.Players.Select(p => new ThronetekiGamePlayer
                    {
                        Player = p.Name,
                        DeckId = p.DeckId,
                        TotalPower = p.Power
                    })
                }
            }
        });
    }
}