using Throneteki.Data.Models.RestrictedList;

namespace Throneteki.Models.Models;

public class LobbyRestrictedList
{
    public string? Id { get; set; }
    public string Name { get; set; } = null!;
    public DateTime Date { get; set; }
    public string? Issuer { get; set; }
    public RestrictedListCardSet CardSet { get; set; }
    public string? Version { get; set; }
    public IReadOnlyCollection<string> Restricted { get; set; } = new List<string>();
    public IReadOnlyCollection<string> Banned { get; set; } = new List<string>();
    public IReadOnlyCollection<RestrictedListPod> Pods { get; set; } = new List<RestrictedListPod>();
    public bool Official { get; set; }
}