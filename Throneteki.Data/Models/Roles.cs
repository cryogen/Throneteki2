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
    public const string Admin = "Admin";
    public const string Supporter = "Supporter";
    public const string Contributor = "Contributor";
    public const string Winner = "Winner";
    public const string PreviousWinner = "PreviousWinner";
    public const string SupporterWithNoPatreon = "SupporterWithNoPatreon";

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
        TournamentManager,
        Admin,
        Supporter,
        Contributor,
        Winner,
        PreviousWinner,
        SupporterWithNoPatreon
    };
}