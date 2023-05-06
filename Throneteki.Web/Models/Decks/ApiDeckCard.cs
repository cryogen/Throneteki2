namespace Throneteki.Web.Models.Decks;

public class ApiDeckCard
{
    public int Count { get; set; }
    public ApiCard Card { get; set; } = null!;
    public string Type { get; set; } = null!;
}