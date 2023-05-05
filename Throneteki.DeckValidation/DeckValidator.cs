using Throneteki.Lobby.Models;
using Throneteki.WebService;

namespace Throneteki.DeckValidation;

public class DeckValidator
{
    private readonly Dictionary<string, Models.Models.LobbyPack> releasedPacks;
    private readonly IReadOnlyCollection<RestrictedListValidator> restrictedListValidators;

    public DeckValidator(IEnumerable<Models.Models.LobbyPack> packs, IEnumerable<LobbyRestrictedList> restrictedListRules)
    {
        releasedPacks = packs.Where(p => p.ReleaseDate != null && p.ReleaseDate <= DateTime.UtcNow)
            .ToDictionary(k => k.Code, v => v);
        restrictedListValidators = restrictedListRules.Select(r => new RestrictedListValidator(r)).ToList();
    }

    public DeckValidationStatus ValidateDeck(LobbyDeck deck)
    {
        var validators = new List<StandardValidator> { new FactionValidator(deck.Faction.Code) };
        var standardValidator = new StandardValidator();
        var errors = new List<string>();

        foreach (var agenda in deck.Agendas)
        {
            if (Rules.Agenda.TryGetValue(agenda.Code, out var agendaValidator))
            {
                validators.Add(agendaValidator);

                ConsolidateStandardValidators(agendaValidator, standardValidator);
            }
        }

        validators.Add(standardValidator);

        var plotCount = deck.CountPlotCards();
        var drawCount = deck.CountDrawCards();

        if (plotCount < standardValidator.RequiredPlots)
        {
            errors.Add("Too few plot cards");
        }
        else if (plotCount > standardValidator.RequiredPlots)
        {
            errors.Add("Too many plot cards");
        }

        if (drawCount < standardValidator.RequiredDraw)
        {
            errors.Add("Too few draw cards");
        }

        var rules = validators.SelectMany(v => v.Rules);

        var cardCountsByName = deck.GetCardCountsByName();

        errors.AddRange(deck.GetAllDeckCards()
            .Where(card => !validators.Any(v => v.MayInclude(card)) || validators.Any(v => v.CannotInclude(card)))
            .Select(card => $"{card.Label} is not allowed by faction or agenda"));

        var unreleasedCards = deck.GetUniqueCards()
            .Where(card => !releasedPacks.ContainsKey(card.PackCode))
            .Select(card => $"{card.Label} is not yet released").ToList();

        var doubledPlots = cardCountsByName.Values.Where(card => card.Card.Type == "plot" && card.Count == 2);
        if (doubledPlots.Count() > standardValidator.MaxDoubledPlots)
        {
            errors.Add($"Maximum allowed number of doubled plots: {standardValidator.MaxDoubledPlots}");
        }

        errors.AddRange(cardCountsByName.Values.Where(deckCard => deckCard.Count > deckCard.Card.DeckLimit)
            .Select(deckCard => $"{deckCard.Card.Name} has limit {deckCard.Card.DeckLimit}"));

        var restrictedListResults = restrictedListValidators.Select(restrictedList => restrictedList.Validate(deck)).ToList();
        var officialRestrictedResult = restrictedListResults.Any()
            ? restrictedListResults.First()
            : new RestrictedListValidationStatus
            {
                NoBannedCards = true,
                RestrictedRules = true,
                Version = string.Empty
            };

        var restrictedListErrors = restrictedListResults.SelectMany(r => r.Errors);

        return new DeckValidationStatus
        {
            BasicRules = !errors.Any(),
            FaqJoustRules = officialRestrictedResult.RestrictedRules,
            FaqVersion = officialRestrictedResult.Version,
            NoBannedCards = officialRestrictedResult.NoBannedCards,
            RestrictedLists = restrictedListResults,
            NoUnreleasedCards = !unreleasedCards.Any(),
            PlotCount = plotCount,
            DrawCount = drawCount,
            Errors = errors.Concat(unreleasedCards).Concat(restrictedListErrors).ToArray()
        };
    }

    private static void ConsolidateStandardValidators(StandardValidator agendaValidator, StandardValidator standardValidator)
    {
        if (agendaValidator.MaxDoubledPlots != standardValidator.MaxDoubledPlots)
        {
            standardValidator.MaxDoubledPlots = agendaValidator.MaxDoubledPlots;
        }

        if (agendaValidator.RequiredDraw != standardValidator.RequiredDraw)
        {
            standardValidator.RequiredDraw = agendaValidator.RequiredDraw;
        }

        if (agendaValidator.RequiredPlots != standardValidator.RequiredPlots)
        {
            standardValidator.RequiredPlots = agendaValidator.RequiredPlots;
        }
    }
}