using System.Linq.Dynamic.Core;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Throneteki.Data;
using Throneteki.Data.Models;
using Throneteki.DeckValidation;
using Throneteki.Models.Models;
using Throneteki.Models.Services;
using Throneteki.Web.Models;
using Throneteki.Web.Models.Decks;

namespace Throneteki.Web.Services;

public class DeckService
{
    private readonly CardService _cardService;
    private readonly ThronetekiDbContext _context;
    private readonly IMapper _mapper;

    public DeckService(ThronetekiDbContext context, CardService cardService, IMapper mapper)
    {
        _context = context;
        _cardService = cardService;
        _mapper = mapper;
    }

    public async Task AddOrUpdateDeck(ThronetekiUser user, AddDeckRequest request, CancellationToken cancellationToken = default)
    {
        Deck deck;

        if (request is EditDeckRequest editRequest)
        {
            deck = await _context.Decks.FirstAsync(d => d.Id == editRequest.Id, cancellationToken);
        }
        else
        {
            deck = new Deck
            {
                UserId = user.Id,
                Created = DateTime.UtcNow
            };
            
            _context.Decks.Add(deck);
        }

        deck.Name = request.Name;
        deck.FactionId = request.Faction;
        deck.AgendaId = request.Agenda;
        deck.Updated = DateTime.UtcNow;

        var deckCards = new List<DeckCard>();

        deckCards.AddRange(request.BannerCards.Select(id => new DeckCard
        {
            Deck = deck,
            CardId = id,
            CardType = DeckCardType.Banner,
            Count = 1
        }));
        deckCards.AddRange(GetDeckCardsFromRequest(request.DrawCards, deck, DeckCardType.Draw));
        deckCards.AddRange(GetDeckCardsFromRequest(request.PlotCards, deck, DeckCardType.Plot));

        deck.DeckCards = deckCards;

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<ApiPagedDataResponse<IEnumerable<ApiDeck>>> GetDecksForUser(ThronetekiUser user,
        string? restrictedList, DataLoadOptions options)
    {
        var baseQuery = _context.Decks.Include(d => d.Faction)
            .Include(d => d.Agenda)
            .ThenInclude(a => a != null ? a.Faction : null)
            .Include(d => d.DeckCards)
            .ThenInclude(dc => dc.Card)
            .ThenInclude(c => c.Faction)
            .Where(d => d.UserId == user.Id)
            .Select(d => new DeckWithStats
            {
                Deck = d,
                Wins = _context.GamePlayers.Count(gp =>
                    gp.DeckId == d.Id && gp.PlayerId == d.UserId && gp.Game.WinnerId == d.UserId),
                Losses = _context.GamePlayers.Count(gp =>
                    gp.DeckId == d.Id && gp.PlayerId == d.UserId && !string.IsNullOrEmpty(gp.Game.WinnerId) &&
                    gp.Game.WinnerId != d.UserId)
            })
            .Select(ds => new DeckWithStats
            {
                Deck = ds.Deck,
                Wins = ds.Wins,
                Losses = ds.Losses,
                WinRate = ds.Wins + ds.Losses > 0 ? (int)(ds.Wins / (double)(ds.Wins + ds.Losses)) * 100 : null
            });

        if (options.Filters != null && options.Filters.Any())
        {
            foreach (var filter in options.Filters)
            {
                if (filter.Id == null)
                {
                    continue;
                }

                if (filter.Value != null && filter.Value.Contains(','))
                {
                    var filterList = filter.Value
                        .Split(",", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
                    baseQuery = baseQuery.Where("(@0).Contains(faction.name)", filterList);
                }
                else
                {
                    baseQuery = baseQuery.Where($"{filter.Id}.Contains(@0)", filter.Value);
                }
            }
        }

        var rowCount = await baseQuery.CountAsync();

        if (options.Sorting != null && options.Sorting.Any())
        {
            baseQuery = baseQuery.OrderBy(string.Join(", ",
                options.Sorting.Select(o =>
                    $"{(o.Id != "winRate" ? "deck." : string.Empty)}{o.Id}{(o.Desc ? " desc" : string.Empty)}")));
        }

        var decks = await baseQuery
            .Skip(options.PageNumber * options.PageSize)
            .Take(options.PageSize)
            .ToListAsync();

        var packs = _mapper.Map<IEnumerable<LobbyPack>>(await _context.Packs.ToListAsync());
        var restrictedLists = await _cardService.GetRestrictedLists();

        if (restrictedList != null)
        {
            restrictedLists = restrictedLists.Where(rl => rl.Id == restrictedList).ToList();
        }

        var validator = new DeckValidator(packs, restrictedLists);

        var apiDecks = new List<ApiDeck>();
        foreach (var deck in decks)
        {
            var apiDeck = _mapper.Map<ApiDeck>(deck);
            apiDeck.Status = validator.ValidateDeck(_mapper.Map<LobbyDeck>(deck.Deck));

            apiDecks.Add(apiDeck);
        }

        return new ApiPagedDataResponse<IEnumerable<ApiDeck>>
        {
            Success = true,
            Data = apiDecks,
            TotalCount = rowCount
        };
    }

    public async Task<ApiDeck?> GetDeckById(int deckId, string? restrictedList = null)
    {
        var deck = await _context.Decks
            .Include(d => d.Faction)
            .Include(d => d.Agenda)
            .Include(d => d.DeckCards)
            .ThenInclude(dc => dc.Card)
            .Select(d => new DeckWithStats
            {
                Deck = d,
                Wins = _context.GamePlayers.Count(gp =>
                    gp.DeckId == d.Id && gp.PlayerId == d.UserId && gp.Game.WinnerId == d.UserId),
                Losses = _context.GamePlayers.Count(gp =>
                    gp.DeckId == d.Id && gp.PlayerId == d.UserId && !string.IsNullOrEmpty(gp.Game.WinnerId) &&
                    gp.Game.WinnerId != d.UserId)
            })
            .Select(ds => new DeckWithStats
            {
                Deck = ds.Deck,
                Wins = ds.Wins,
                Losses = ds.Losses,
                WinRate = ds.Wins + ds.Losses > 0 ? (int)(ds.Wins / (double)(ds.Wins + ds.Losses)) * 100 : null
            })
            .FirstOrDefaultAsync(d => d.Deck.Id == deckId);

        if (deck == null)
        {
            return null;
        }

        var packs = _mapper.Map<IEnumerable<LobbyPack>>(await _context.Packs.ToListAsync());
        var restrictedLists = await _cardService.GetRestrictedLists();

        if (restrictedList != null)
        {
            restrictedLists = restrictedLists.Where(rl => rl.Id == restrictedList).ToList();
        }

        var validator = new DeckValidator(packs, restrictedLists);

        var apiDeck = _mapper.Map<ApiDeck>(deck);

        apiDeck.Status = validator.ValidateDeck(_mapper.Map<LobbyDeck>(deck.Deck));

        return apiDeck;
    }

    public async Task DeleteDecks(ThronetekiUser user, IEnumerable<int> deckIds)
    {
        var decksToDelete = _context.Decks.Where(d => d.UserId == user.Id && deckIds.Contains(d.Id));
        _context.Decks.RemoveRange(decksToDelete);

        await _context.SaveChangesAsync();
    }

    public async Task DeleteDeck(int deckId)
    {
        var deck = await _context.Decks.FirstOrDefaultAsync(d => d.Id == deckId);

        if (deck == null)
        {
            return;
        }

        _context.Decks.Remove(deck);

        await _context.SaveChangesAsync();
    }

    public async Task Update(ApiDeck deck)
    {
        var dbDeck = await _context.Decks.FirstOrDefaultAsync(d => d.Id == deck.Id);
        if (dbDeck == null)
        {
            return;
        }

        dbDeck.IsFavourite = deck.IsFavourite;

        await _context.SaveChangesAsync();
    }

    private static IEnumerable<DeckCard> GetDeckCardsFromRequest(Dictionary<string, int> cardList, Deck deck,
        DeckCardType deckCardType)
    {
        var deckCards = new List<DeckCard>();

        foreach (var (cardId, count) in cardList)
            deckCards.Add(new DeckCard
            {
                Deck = deck,
                CardId = int.Parse(cardId),
                CardType = deckCardType,
                Count = count
            });

        return deckCards;
    }
}