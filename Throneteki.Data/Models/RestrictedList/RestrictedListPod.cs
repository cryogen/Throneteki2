namespace Throneteki.Data.Models.RestrictedList;

public class RestrictedListPod
{
    public IReadOnlyCollection<string> Cards { get; set; } = new List<string>();
    public string? Restricted { get; set; }
}