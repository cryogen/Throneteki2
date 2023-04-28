namespace Throneteki.Web.Models.Decks;

public class ThronesDbDeck
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public DateTime DateCreation { get; set; }
    public DateTime DateUpdate { get; set; }
    public string? DescriptionMd { get; set; }
    public int UserId { get; set; }
    public string? FactionCode { get; set; }
    public string? FactionName { get; set; }
    public Dictionary<string, int>? Slots { get; set; }
    public List<string>? Agendas { get; set; }
    public List<string>? AgendaUrls { get; set; }
    public string? Version { get; set; }
    public string? Problem { get; set; }
    public string? Tags { get; set; }
    public string? Uuid { get; set; }
    public bool IsSynced { get; set; }
}