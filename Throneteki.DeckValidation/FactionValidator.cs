namespace Throneteki.DeckValidation;

public class FactionValidator : StandardValidator
{
    public FactionValidator(string faction)
    {
        MayInclude = card => card.Faction == faction || card.Faction == "neutral";
    }
}