namespace Throneteki.Web.Models.Decks;

public class ApiDeck
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? ExternalId { get; set; }
    public DateTime Created { get; set; }
    public DateTime Updated { get; set; }
    public ApiCard? Agenda { get; set; }
    public ApiFaction Faction { get; set; } = null!;
    public IEnumerable<ApiDeckCard> DeckCards { get; set; } = new List<ApiDeckCard>();
    public bool IsFavourite { get; set; }
}