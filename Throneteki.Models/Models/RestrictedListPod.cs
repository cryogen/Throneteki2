namespace Throneteki.Models.Models;

public class RestrictedListPod
{
    public IReadOnlyCollection<string> Cards { get; set; } = new List<string>();
    public string? Restricted { get; set; }
}