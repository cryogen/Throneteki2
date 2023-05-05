using Throneteki.WebService;

namespace Throneteki.DeckValidation;

public class StandardValidator
{
    public int MaxDoubledPlots { get; set; } = 1;
    public int RequiredDraw { get; set; } = 60;
    public int RequiredPlots { get; set; } = 7;
    public ValidationRule[] Rules { get; set; } = Array.Empty<ValidationRule>();

    public Func<LobbyCard, bool> MayInclude { get; set; } = _ => true;

    public Func<LobbyCard, bool> CannotInclude { get; set; } = _ => false;

    protected static int GetDeckCount(IEnumerable<LobbyDeckCard> deckCards)
    {
        return deckCards.Sum(cardEntry => cardEntry.Count);
    }
}