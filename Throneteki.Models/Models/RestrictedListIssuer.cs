using System.ComponentModel;

namespace Throneteki.Models.Models;

public enum RestrictedListIssuer
{
    [Description("Fantasy Flight Games")]
    FantasyFlightGames,
    [Description("The Conclave")]
    TheConclave,
    [Description("Design Team")]
    DesignTeam,
    [Description("Global Operations Team (G.O.T.)")]
    GlobalOperationsTeam
}