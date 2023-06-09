namespace Throneteki.Web.Models.Decks;

public class DeleteDecksRequest
{
    public IReadOnlyCollection<int> DeckIds { get; set; } = new List<int>();
}