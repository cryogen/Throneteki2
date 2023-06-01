namespace Throneteki.Models.Models;

public class LobbyDeck
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? Owner { get; set; }
    public LobbyFaction Faction { get; set; } = null!;
    public IReadOnlyCollection<LobbyCard> Agendas { get; set; } = new List<LobbyCard>();
    public IReadOnlyCollection<LobbyDeckCard> DrawCards { get; set; } = new List<LobbyDeckCard>();
    public IReadOnlyCollection<LobbyDeckCard> PlotCards { get; set; } = new List<LobbyDeckCard>();
    public DeckValidationStatus? ValidationStatus { get; set; }

    public LobbyCard? Agenda => Agendas.SingleOrDefault(a => !a.Traits.Contains("banner", StringComparer.OrdinalIgnoreCase));

    public LobbyCard[] BannerCards =>
        Agendas.Where(a => a.Traits.Contains("banner", StringComparer.OrdinalIgnoreCase)).ToArray();

    public IEnumerable<LobbyCard> GetAllDeckCards()
    {
        return PlotCards.Select(pc => pc.Card).Concat(DrawCards.Select(dc => dc.Card));
    }

    public IEnumerable<LobbyCard> GetUniqueCards()
    {
        return GetAllDeckCards().Concat(Agendas);
    }

    public IEnumerable<LobbyDeckCard> GetAgendaCardsWithCounts()
    {
        return Agendas.Select(agenda => new LobbyDeckCard { Card = agenda, Count = 1 });
    }

    public IEnumerable<LobbyDeckCard> GetAllCards()
    {
        return GetAgendaCardsWithCounts().Concat(DrawCards).Concat(PlotCards);
    }

    public IDictionary<string, LobbyDeckCard> GetCardCountsByName()
    {
        var cardCountsByName = new Dictionary<string, LobbyDeckCard>();
        foreach (var deckCard in GetAllCards())
        {
            if (!cardCountsByName.ContainsKey(deckCard.Card.Name))
            {
                cardCountsByName.Add(deckCard.Card.Name, new LobbyDeckCard
                {
                    Card = deckCard.Card,
                    Count = 0
                });
            }

            cardCountsByName[deckCard.Card.Name].Count += deckCard.Count;
        }

        return cardCountsByName;
    }

    public int CountDrawCards(Func<LobbyCard, bool>? predicate = null)
    {
        return GetDeckCount(DrawCards.Where(deckCard => predicate == null || predicate(deckCard.Card)));
    }

    public int CountPlotCards(Func<LobbyCard, bool>? predicate = null)
    {
        return GetDeckCount(PlotCards.Where(deckCard => predicate == null || predicate(deckCard.Card)));
    }

    public int CountCards(Func<LobbyCard, bool>? predicate = null)
    {
        return GetDeckCount(GetAllCards().Where(cardQuantity => predicate == null || predicate(cardQuantity.Card)));
    }

    private int GetDeckCount(IEnumerable<LobbyDeckCard> deckCards)
    {
        return deckCards.Sum(deckCard => deckCard.Count);
    }

}