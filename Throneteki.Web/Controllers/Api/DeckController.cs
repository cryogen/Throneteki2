﻿using JorgeSerrano.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using OpenIddict.Validation.AspNetCore;
using System.Linq.Dynamic.Core;
using System.Net.Http.Headers;
using System.Text.Json;
using AutoMapper;
using Throneteki.Data;
using Throneteki.Data.Models;
using Throneteki.DeckValidation;
using Throneteki.Models.Models;
using Throneteki.Web.Models;
using Throneteki.Web.Models.Decks;
using Throneteki.Web.Models.Options;
using Throneteki.Models.Services;

namespace Throneteki.Web.Controllers.Api;

[ApiController]
[Authorize(AuthenticationSchemes = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme)]
[Route("/api/decks/")]
public class DeckController : ControllerBase
{
    private readonly ThronetekiDbContext context;
    private readonly UserManager<ThronetekiUser> userManager;
    private readonly ILogger<DeckController> logger;
    private readonly IMapper mapper;
    private readonly CardService cardService;
    private readonly ThronesDbOptions thronesDbOptions;
    private readonly JsonSerializerOptions jsonOptions;

    public DeckController(ThronetekiDbContext context, UserManager<ThronetekiUser> userManager, 
        IOptions<ThronesDbOptions> thronesDbOptions, ILogger<DeckController> logger, IMapper mapper,
        CardService cardService)
    {
        this.context = context;
        this.userManager = userManager;
        this.logger = logger;
        this.mapper = mapper;
        this.cardService = cardService;
        this.thronesDbOptions = thronesDbOptions.Value;
        jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = new JsonSnakeCaseNamingPolicy() };
    }

    [HttpPost]
    public async Task<IActionResult> AddDeck(AddDeckRequest request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByNameAsync(User.Identity!.Name);
        if (user == null)
        {
            return Unauthorized();
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                Success = false,
                Message = ModelState.Select(e => $"{e.Key} - {e.Value}")
            });
        }

        var deck = new Deck
        {
            UserId = user.Id,
            Name = request.Name, // Name is validated by required attribute
            FactionId = request.Faction,
            AgendaId = request.Agenda,
            Created = DateTime.UtcNow,
            Updated = DateTime.UtcNow
        };

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

        context.Decks.Add(deck);

        await context.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            Success = true
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetDecks([FromQuery] DataLoadOptions options)
    {
        var user = await userManager.FindByNameAsync(User.Identity!.Name);
        if (user == null)
        {
            return Unauthorized();
        }

        var baseQuery = context.Decks.Where(d => d.UserId == user.Id);

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
                    var filterList = filter.Value.Split(",", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
                    baseQuery = baseQuery.Where("(@0).Contains(faction.name)", filterList);
                }
                else
                {
                    baseQuery = baseQuery.Where($"{filter.Id}.Contains(@0)", filter.Value);
                }
            }
        }

        var rowCount = await baseQuery.CountAsync();

        baseQuery = baseQuery.Include(d => d.Faction)
            .Include(d => d.Agenda)
            .Include(d => d.DeckCards)
            .ThenInclude(dc => dc.Card);

        if (options.Sorting != null && options.Sorting.Any())
        {
            baseQuery = baseQuery.OrderBy(string.Join(", ", options.Sorting.Select(o => $"{o.Id}{(o.Desc ? " desc" : string.Empty)}")));
        }

        var decks = await baseQuery
            .Skip(options.PageNumber * options.PageSize)
            .Take(options.PageSize)
            .ToListAsync();

        var packs = mapper.Map<IEnumerable<LobbyPack>>(await context.Packs.ToListAsync());
        var validator = new DeckValidator(packs, await cardService.GetRestrictedLists());

        var apiDecks = decks.Select(d => new ApiDeck
        {
            Id = d.Id,
            Name = d.Name,
            ExternalId = d.ExternalId,
            Created = d.Created,
            Updated = d.Updated,
            Agenda = d.Agenda != null
                ? new ApiCard
                {
                    Code = d.Agenda.Code,
                    Label = d.Agenda.Label
                }
                : null,
            Faction = new ApiFaction
            {
                Code = d.Faction.Code,
                Name = d.Faction.Name ?? string.Empty
            },
            DeckCards = d.DeckCards.Select(dc => new ApiDeckCard
            {
                Count = dc.Count,
                Card = new ApiCard
                {
                    Code = dc.Card.Code,
                    Label = dc.Card.Label
                },
                Type = dc.CardType.ToString()
            }),
            IsFavourite = d.IsFavourite,
            Status = validator.ValidateDeck(mapper.Map<LobbyDeck>(d))
        });

        return Ok(new
        {
            Success = true,
            TotalCount = rowCount,
            Data = apiDecks
        });
    }

    [HttpGet("{deckId}")]
    public async Task<IActionResult> GetDeck(int deckId)
    {
        var user = await userManager.FindByNameAsync(User.Identity!.Name);
        if (user == null)
        {
            return Unauthorized();
        }

        var deck = await context.Decks
            .Include(d => d.Faction)
            .Include(d => d.Agenda)
            .Include(d => d.DeckCards)
            .ThenInclude(dc => dc.Card)
            .FirstOrDefaultAsync(d => d.Id == deckId);

        if (deck == null)
        {
            return NotFound();
        }

        if (deck.UserId != user.Id)
        {
            return Forbid();
        }

        var packs = mapper.Map<IEnumerable<LobbyPack>>(await context.Packs.ToListAsync());
        var validator = new DeckValidator(packs, await cardService.GetRestrictedLists());

        return Ok(new
        {
            Success = true,
            Deck = new ApiDeck
            {
                Id = deck.Id,
                Name = deck.Name,
                ExternalId = deck.ExternalId,
                Created = deck.Created,
                Updated = deck.Updated,
                Agenda = deck.Agenda != null
                    ? new ApiCard
                    {
                        Code = deck.Agenda.Code,
                        Label = deck.Agenda.Label
                    }
                    : null,
                Faction = new ApiFaction
                {
                    Code = deck.Faction.Code,
                    Name = deck.Faction.Name ?? string.Empty
                },
                DeckCards = deck.DeckCards.Select(dc => new ApiDeckCard
                {
                    Count = dc.Count,
                    Card = new ApiCard
                    {
                        Code = dc.Card.Code,
                        Label = dc.Card.Label
                    },
                    Type = dc.CardType.ToString()
                }),
                IsFavourite = deck.IsFavourite,
                Status = validator.ValidateDeck(mapper.Map<LobbyDeck>(deck))
            }
        });
    }

    [HttpGet("groupFilter")]
    public async Task<IActionResult> GetGroupFilterForDecks(string column, [FromQuery] DataLoadOptions options)
    {
        var user = await userManager.FindByNameAsync(User.Identity!.Name);
        if (user == null)
        {
            return Unauthorized();
        }

        var query = context.Decks
            .Where(d => d.UserId == user.Id);

        if (options.Filters != null && options.Filters.Any())
        {
            foreach (var filter in options.Filters)
            {
                if (filter.Value == null || filter.Value.Contains(','))
                {
                    continue;
                }

                query = query.Where($"{filter.Id}.Contains(@0)", filter.Value);
            }
        }

        return Ok(query.Select(column).Distinct());
    }

    [HttpGet("thronesdb/status")]
    public async Task<IActionResult> GetThronesDbLinkStatus()
    {
        var user = await userManager.FindByNameAsync(User.Identity!.Name);
        if (user == null)
        {
            return Unauthorized();
        }

        var anyThronesDbToken = await userManager.Users
            .Include(u => u.ExternalTokens)
            .AnyAsync(u => u.Id == user.Id && u.ExternalTokens.Any(t => t.ExternalId == "ThronesDB"));

        return Ok(new
        {
            Success = true,
            Linked = anyThronesDbToken
        });
    }

    [HttpGet("thronesdb")]
    public async Task<IActionResult> GetThronesDbDecks(CancellationToken cancellationToken)
    {
        var user = await userManager.FindByNameAsync(User.Identity!.Name);
        if (user == null)
        {
            return Unauthorized();
        }

        user = await userManager.Users.Include(u => u.ExternalTokens).FirstOrDefaultAsync(u => u.Id == user.Id, cancellationToken);
        if (user == null)
        {
            return Unauthorized();
        }

        var token = user.ExternalTokens.FirstOrDefault(t => t.ExternalId == "ThronesDB");

        if (token == null)
        {
            return Ok(new
            {
                Success = false,
                Message = "You need to link your ThronesDB account"
            });
        }

        var httpClient = new HttpClient
        {
            BaseAddress = new Uri("https://thronesdb.com/api/")
        };

        if (token.Expiry < DateTime.UtcNow)
        {
            if (!await RefreshToken(httpClient, token, cancellationToken))
            {
                return Ok(new
                {
                    Success = false,
                    Message = "An error occurred loading decks, your account needs to be re-linked to ThronesDB"
                });
            }
        }

        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.AccessToken);

        var dbDecks = await context.Decks
            .Include(d => d.DeckCards)
            .Where(d => d.UserId == user.Id && d.ExternalId != null)
            .ToDictionaryAsync(k => k.ExternalId!, v => v, cancellationToken);

        var decks = await httpClient.GetFromJsonAsync<IEnumerable<ThronesDbDeck>>("oauth2/decks", jsonOptions, cancellationToken);
        if (decks == null)
        {
            return BadRequest(new
            {
                Success = false,
                Message = "An error occurred fetching decks from ThronesDB"
            });
        }

        decks = decks.ToList();

        foreach (var deck in decks)
        {
            if (deck.Uuid != null && dbDecks.ContainsKey(deck.Uuid))
            {
                deck.IsSynced = true;
            }
        }

        return Ok(new
        {
            Success = true,
            Data = decks
        });
    }

    [HttpPost("thronesdb")]
    public async Task<IActionResult> ImportThronesDbDecks([FromBody] IEnumerable<int> deckIds, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByNameAsync(User.Identity!.Name);
        if (user == null)
        {
            return Unauthorized();
        }

        user = await userManager.Users.Include(u => u.ExternalTokens).FirstOrDefaultAsync(u => u.Id == user.Id, cancellationToken);
        if (user == null)
        {
            return Unauthorized();
        }

        var token = user.ExternalTokens.FirstOrDefault(t => t.ExternalId == "ThronesDB");
        if (token == null)
        {
            return Ok(new
            {
                Success = false,
                Message = "You need to link your ThronesDB account"
            });
        }

        var httpClient = new HttpClient
        {
            BaseAddress = new Uri("https://thronesdb.com/api/")
        };

        if (token.Expiry < DateTime.UtcNow)
        {
            if (!await RefreshToken(httpClient, token, cancellationToken))
            {
                return Ok(new
                {
                    Success = false,
                    Message = "An error occurred importing decks, your account needs to be re-linked to ThronesDB"
                });
            }
        }

        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.AccessToken);

        var thronesDbDecks = await httpClient.GetFromJsonAsync<IEnumerable<ThronesDbDeck>>("oauth2/decks", jsonOptions, cancellationToken);
        if (thronesDbDecks == null)
        {
            return BadRequest(new
            {
                Success = false,
                Message = "An error occurred importing decks, please try again later"
            });
        }

        var decks = thronesDbDecks.Where(d => deckIds.Contains(d.Id));
        var dbDecks = await context.Decks
            .Include(d => d.DeckCards)
            .Where(d => d.UserId == user.Id && d.ExternalId != null)
            .ToDictionaryAsync(k => k.ExternalId!, v => v, cancellationToken);
        var dbFactions = await context.Factions.ToDictionaryAsync(k => k.Code, v => v, cancellationToken);
        var dbCards = await context.Cards.ToDictionaryAsync(k => k.Code, v => v, cancellationToken);

        const string bannerAgendaCode = "06018";

        foreach (var deck in decks)
        {
            var deckId = deck.Uuid;
            if (deckId == null)
            {
                continue;
            }

            if (!dbDecks.TryGetValue(deckId, out var dbDeck))
            {
                dbDeck = new Deck();
                context.Decks.Add(dbDeck);
            }

            dbDeck.ExternalId = deck.Uuid;
            dbDeck.Name = deck.Name ?? string.Empty;

            dbDeck.Created = deck.DateCreation;
            dbDeck.Updated = deck.DateUpdate;
            dbDeck.Faction = dbFactions[deck.FactionCode!];
            dbDeck.UserId = user.Id;

            if (deck.Agendas != null && deck.Agendas.Any(a => a == bannerAgendaCode))
            {
                dbDeck.Agenda = dbCards[bannerAgendaCode];

                foreach (var agenda in deck.Agendas.Where(a => a != bannerAgendaCode))
                {
                    if (!dbDeck.DeckCards.Any(dc => dc.CardId == dbCards[agenda].Id))
                    {
                        dbDeck.DeckCards.Add(new DeckCard
                        {
                            Card = dbCards[agenda],
                            CardType = DeckCardType.Banner,
                            DeckId = dbDeck.Id,
                            Count = 1
                        });
                    }
                }
            }
            else if (deck.Agendas != null && deck.Agendas.Any())
            {
                dbDeck.Agenda = dbCards[deck.Agendas.First()];
            }


            foreach (var (code, count) in deck.Slots!)
            {
                if (!dbDeck.DeckCards.Any(dc => dc.CardId == dbCards[code].Id))
                {
                    if (dbCards[code].Type == "agenda")
                    {
                        continue;
                    }

                    dbDeck.DeckCards.Add(new DeckCard
                    {
                        Card = dbCards[code],
                        CardType = dbCards[code].Type == "plot" ? DeckCardType.Plot : DeckCardType.Draw,
                        Deck = dbDeck,
                        Count = count
                    });
                }
            }
        }

        await context.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            Success = true
        });
    }

    [HttpPost("{deckId}/toggleFavourite")]
    public async Task<IActionResult> ToggleFavouriteDeck(int deckId, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByNameAsync(User.Identity!.Name);
        if (user == null)
        {
            return Unauthorized();
        }

        var deck = await context.Decks.FirstOrDefaultAsync(d => d.Id == deckId, cancellationToken);
        if (deck == null)
        {
            return NotFound();
        }

        if (deck.UserId != user.Id)
        {
            return Forbid();
        }

        deck.IsFavourite = !deck.IsFavourite;

        await context.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            Success = true
        });
    }

    private async Task<bool> RefreshToken(HttpClient httpClient, ExternalToken token, CancellationToken cancellationToken)
    {
        if (thronesDbOptions.ClientId == null || thronesDbOptions.ClientSecret == null)
        {
            return false;
        }

        var request = new List<KeyValuePair<string, string>>
        {
            new("client_id", thronesDbOptions.ClientId),
            new("client_secret", thronesDbOptions.ClientSecret),
            new("grant_type", "refresh_token"),
            new("refresh_token", token.RefreshToken)
        };

        using var content = new FormUrlEncodedContent(request);
        content.Headers.ContentType = new MediaTypeHeaderValue("application/x-www-form-urlencoded");

        var response = await httpClient.PostAsync("https://thronesdb.com/oauth/v2/token", content, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var responseStr = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogWarning($"Error refreshing thronesdb token: {responseStr}");

            return false;
        }

        var tokenResponse = await response.Content.ReadFromJsonAsync<TokenResponse>(jsonOptions, cancellationToken);

        if (tokenResponse?.AccessToken == null || tokenResponse.RefreshToken == null)
        {
            return false;
        }

        token.AccessToken = tokenResponse.AccessToken;
        token.RefreshToken = tokenResponse.RefreshToken;
        token.Expiry = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn);

        await context.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static IEnumerable<DeckCard> GetDeckCardsFromRequest(Dictionary<string, int> cardList, Deck deck, DeckCardType deckCardType)
    {
        var deckCards = new List<DeckCard>();

        foreach (var (cardId, count) in cardList)
        {
            deckCards.Add(new DeckCard
            {
                Deck = deck,
                CardId = int.Parse(cardId),
                CardType = deckCardType,
                Count = count
            });
        }

        return deckCards;
    }
}