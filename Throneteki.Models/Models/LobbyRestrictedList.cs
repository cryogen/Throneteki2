using Throneteki.Data.Models.RestrictedList;

namespace Throneteki.Models.Models;

public class LobbyRestrictedList
{
    public string Id { get; set; }
    public string Name { get; set; }
    public DateTime Date { get; set; }
    public string Issuer { get; set; }
    public RestrictedListCardSet CardSet { get; set; }
    public string Version { get; set; }
    public IReadOnlyCollection<string> Restricted { get; set; }
    public IReadOnlyCollection<string> Banned { get; set; }
    public IReadOnlyCollection<RestrictedListPod> Pods { get; set; }
    public bool Official { get; set; }
}