namespace Throneteki.Models.Models;

public class RestrictedListFormat
{
    public GameFormat Name { get; set; }
    public IReadOnlyCollection<string> Restricted { get; set; } = new List<string>();
    public IReadOnlyCollection<string> Banned { get; set; } = new List<string>();
    public IReadOnlyCollection<RestrictedListPod> Pods { get; set; } = new List<RestrictedListPod>();
}