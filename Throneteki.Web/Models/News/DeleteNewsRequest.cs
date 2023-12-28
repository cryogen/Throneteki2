namespace Throneteki.Web.Models.Decks;

public class DeleteNewsRequest
{
    public IReadOnlyCollection<int> NewsIds { get; set; } = new List<int>();
}