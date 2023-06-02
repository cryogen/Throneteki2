using StackExchange.Redis;

namespace Throneteki.Lobby.Models;

public static class LobbyCommands
{
    public const string Hello = "HELLO";
    public const string LobbyHello = "LOBBYHELLO";
    public const string StartGame = "STARTGAME";
    public const string GameWin = "GAMEWIN";
    public const string GameClosed = "GAMECLOSED";
}