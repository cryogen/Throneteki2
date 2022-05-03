namespace Throneteki.Data.Models;

public static class Roles
{
    public const string UserManager = "UserManager";
    public const string PermissionsManager = "PermissionsManager";
    public const string ChatManager = "ChatManager";
    public const string GameManager = "GameManager";
    public const string NewsManager = "NewsManager";
    public const string NodeManager = "NodeManager";
    public const string BanListManager = "BanListManager";
    public const string MotdManager = "MotdManager";
    public const string TournamentManager = "TournamentManager";

    public static List<string> AvailableRoles = new()
    {
        UserManager,
        PermissionsManager,
        ChatManager,
        GameManager,
        NewsManager,
        NodeManager,
        BanListManager,
        MotdManager,
        TournamentManager
    };
}