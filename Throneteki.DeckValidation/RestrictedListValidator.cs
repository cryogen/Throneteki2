using Throneteki.Data.Models.RestrictedList;
using Throneteki.Models.Models;

namespace Throneteki.DeckValidation;

public class RestrictedListValidator
{
    private readonly LobbyRestrictedList _rules;
    private readonly IReadOnlyCollection<RestrictedListPod> _pods;

    public RestrictedListValidator(LobbyRestrictedList restrictedList)
    {
        _rules = restrictedList;
        _pods = restrictedList.Pods;
    }

    public RestrictedListValidationStatus Validate(LobbyDeck deck)
    {
        var cards = deck.GetUniqueCards().ToList();
        var restrictedCardsOnList = cards.Where(card => _rules.Restricted.Contains(card.Code)).ToList();
        var bannedCardsOnList = cards.Where(card => _rules.Banned.Contains(card.Code)).ToList();
        var noBannedCards = true;

        var errors = new List<string>();

        /*
        if (rules.Format == 'draft' && deck.eventId !== this.rules._id)
        {
            noBannedCards = false;
            errors.push(`${ this.rules.name}: Deck wasn't created for this event`);
        }
        */

        if (restrictedCardsOnList.Count > 1)
        {
            errors.Add(
                $"{_rules.Name}: Contains more than 1 card on the restricted list: {string.Join(", ", restrictedCardsOnList.Select(card => card.Name))}");
        }

        if (bannedCardsOnList.Any())
        {
            noBannedCards = false;
            errors.Add(
                $"{_rules.Name}: Contains cards that are not tournament legal: {string.Join(", ", bannedCardsOnList.Select(card => card.Name))}");
        }

        foreach (var pod in _pods)
        {
            var podErrors =
                (pod.Restricted != null ? ValidateRestrictedPods(pod, cards) : ValidateAnyCardPod(pod, cards)).ToList();
            noBannedCards = noBannedCards && !podErrors.Any();
            errors.AddRange(podErrors);
        }

        return new RestrictedListValidationStatus
        {
            Name = _rules.Name,
            Valid = !errors.Any(),
            RestrictedRules = restrictedCardsOnList.Count <= 1,
            NoBannedCards = noBannedCards,
            Errors = errors,
            RestrictedCards = restrictedCardsOnList,
            BannedCards = bannedCardsOnList
        };
    }

    private IEnumerable<string> ValidateRestrictedPods(RestrictedListPod pod, IReadOnlyCollection<LobbyCard> cards)
    {
        var errors = new List<string>();

        var restrictedCard = cards.FirstOrDefault(card => card.Code == pod.Restricted);

        if (restrictedCard == null)
        {
            return errors;
        }

        var cardsOnList = cards.Where(card => pod.Cards.Contains(card.Code)).ToList();
        if (cardsOnList.Any())
        {
            errors.Add(
                $"{_rules.Name}: {string.Join(", ", cardsOnList.Select(card => card.Name))} cannot be used with ${restrictedCard.Name}");
        }

        return errors;
    }

    private IEnumerable<string> ValidateAnyCardPod(RestrictedListPod pod, IEnumerable<LobbyCard> cards)
    {
        var errors = new List<string>();

        var cardsOnList = cards.Where(card => pod.Cards.Contains(card.Code)).ToList();
        if (cardsOnList.Count > 1)
        {
            errors.Add(
                $"{_rules.Name}: {string.Join(", ", cardsOnList.Select(card => card.Name))} cannot be used together");
        }

        return errors;
    }
}