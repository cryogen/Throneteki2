namespace Throneteki.Data.Models.RestrictedList;

public class RestrictedList
{
    public string Version { get; set; } = null!;
    public string? Issuer { get; set; }
    public string Name { get; set; } = null!;
    public RestrictedListCardSet CardSet { get; set; }
    public string Code { get; set; } = null!;
    public DateTime Date { get; set; }
    public IReadOnlyCollection<RestrictedListFormat> Formats { get; set; } = new List<RestrictedListFormat>();
    public IReadOnlyCollection<string> BannedCards { get; set; } = new List<string>();
}