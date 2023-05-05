namespace Throneteki.DeckValidation;

public class BannerValidator : StandardValidator
{
    public BannerValidator(string faction, string factionName)
    {
        Rules = new[]
        {
            new ValidationRule
            {
                Message = $"Must contain 12 or more {factionName} cards",
                Condition = deck => GetDeckCount(deck.DrawCards.Where(dc => dc.Card.Faction == faction)) >= 12
            }
        };

        MayInclude = card => card.Faction == faction && !card.Loyal && card.Type != "Plot";
    }
}