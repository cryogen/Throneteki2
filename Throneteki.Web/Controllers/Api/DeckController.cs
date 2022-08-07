using JorgeSerrano.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using OpenIddict.Validation.AspNetCore;
using System.Linq.Dynamic.Core;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Nodes;
using Throneteki.Data;
using Throneteki.Data.Models;
using Throneteki.Web.Models;
using Throneteki.Web.Models.Options;

namespace Throneteki.Web.Controllers.Api
{
    [ApiController]
    [Authorize(AuthenticationSchemes = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme)]
    public class DeckController : ControllerBase
    {
        private readonly ThronetekiDbContext context;
        private readonly UserManager<ThronetekiUser> userManager;
        private readonly ThronesDbOptions thronesDbOptions;
        private readonly JsonSerializerOptions jsonOptions;

        public DeckController(ThronetekiDbContext context, UserManager<ThronetekiUser> userManager, IOptions<ThronesDbOptions> thronesDbOptions)
        {
            this.context = context;
            this.userManager = userManager;
            this.thronesDbOptions = thronesDbOptions.Value;
            jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = new JsonSnakeCaseNamingPolicy() };
        }

        [HttpPost("api/decks")]
        public async Task<IActionResult> AddDeck(AddDeckRequest request, CancellationToken cancellationToken)
        {
            var user = await userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            if (request == null)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Request cannot be null"
                });
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
                Name = request.Name!, // Name is validated by required attribute
                FactionId = request.Faction,
                AgendaId = request.Agenda,
                Created = DateTime.UtcNow,
                Updated = DateTime.UtcNow,
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

        [HttpGet("/api/decks")]
        public async Task<IActionResult> GetDecks([FromQuery] DataLoadOptions options)
        {
            var user = await userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            var baseQuery = context.Decks
                    .Include(d => d.Faction)
                    .Include(d => d.Agenda)
                    .Include(d => d.DeckCards)
                    .ThenInclude(dc => dc.Card)
                    .Where(d => d.UserId == user.Id);

            if (options.Sorting != null && options.Sorting.Any())
            {
                baseQuery = baseQuery.OrderBy(string.Join(", ", options.Sorting.Select(o => $"{o.Id}{(o.Desc ? " desc" : string.Empty)}")));
            }

            return Ok(new
            {
                Success = true,
                TotalCount = await context.Decks.Where(d => d.UserId == user.Id).CountAsync(),
                Decks = await baseQuery
                    .Skip(options.PageNumber * options.PageSize)
                    .Take(options.PageSize)
                    .Select(d => new
                    {
                        d.Id,
                        d.Name,
                        d.Created,
                        d.Updated,
                        Agenda = d.Agenda != null ? new
                        {
                            d.Agenda.Code,
                            d.Agenda.Label
                        } : null,
                        Faction = d.Faction.Name,
                        DeckCards = d.DeckCards.Select(dc => new
                        {
                            dc.Count,
                            Card = new
                            {
                                dc.Card.Code,
                                dc.Card.Label
                            }
                        })
                    })
                    .ToListAsync()
            });
        }

        [HttpGet("/api/decks/thronesdb/status")]
        public async Task<IActionResult> GetThronesDbLinkStatus()
        {
            var user = await userManager.GetUserAsync(User);
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

        [HttpGet("/api/decks/thronesdb")]
        public async Task<IActionResult> GetThronesDbDecks(CancellationToken cancellationToken)
        {
            var user = await userManager.GetUserAsync(User);
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
                        Message = "An error occured loading decks, your account needs to be re-linked to ThronesDB"
                    });
                }
            }

            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.AccessToken);

            var dbDecks = await context.Decks
                .Include(d => d.DeckCards)
                .Where(d => d.UserId == user.Id && d.ExternalId != null)
                .ToDictionaryAsync(k => k.ExternalId.Value, v => v, cancellationToken);

            var ret = await httpClient.GetStringAsync("oauth2/decks", cancellationToken);
            var response = JsonNode.Parse(ret);

            foreach (var deck in response.AsArray())
            {
                if (dbDecks.ContainsKey((int)deck["id"]!))
                {
                    deck["is_synced"] = true;
                }
            }

            return Ok(new
            {
                Success = true,
                Decks = response
            });
        }

        [HttpPost("/api/decks/thronesdb")]
        public async Task<IActionResult> ImportThronesDbDecks([FromBody] IEnumerable<int> deckIds, CancellationToken cancellationToken)
        {
            var user = await userManager.GetUserAsync(User);
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
                        Message = "An error occured importing decks, your account needs to be re-linked to ThronesDB"
                    });
                }
            }

            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.AccessToken);

            var ret = await httpClient.GetStringAsync("oauth2/decks", cancellationToken);
            var response = JsonNode.Parse(ret);

            if (response == null)
            {
                return Ok(new
                {
                    Success = false,
                    Message = "An error occured importing decks, please try again later"
                });
            }

            var decks = response.AsArray().Where(d => deckIds.Contains((int)d!["id"]!));
            var dbDecks = await context.Decks
                .Include(d => d.DeckCards)
                .Where(d => d.UserId == user.Id && d.ExternalId != null)
                .ToDictionaryAsync(k => k.ExternalId.Value, v => v, cancellationToken);
            var dbFactions = await context.Factions.ToDictionaryAsync(k => k.Code, v => v, cancellationToken);
            var dbCards = await context.Cards.ToDictionaryAsync(k => k.Code, v => v, cancellationToken);

            const string BannerAgendaCode = "06018";

            foreach (var deck in decks)
            {
                if (deck == null)
                {
                    continue;
                }

                var deckId = (int)deck["id"]!;

                if (!dbDecks.TryGetValue(deckId, out var dbDeck))
                {
                    dbDeck = new Deck();
                    context.Decks.Add(dbDeck);
                }

                dbDeck.ExternalId = deckId;
                dbDeck.Name = (string)deck["name"]!;
                dbDeck.Created = (DateTime)deck["date_creation"]!;
                dbDeck.Updated = (DateTime)deck["date_update"]!;
                dbDeck.Faction = dbFactions[(string)deck["faction_code"]!];
                dbDeck.UserId = user.Id;

                var agendas = deck["agendas"].Deserialize<IEnumerable<string>>()!;
                if (agendas.Any(a => a == BannerAgendaCode))
                {
                    dbDeck.Agenda = dbCards[BannerAgendaCode];

                    foreach (var agenda in agendas.Where(a => a != BannerAgendaCode))
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
                else
                {
                    if (agendas.Any())
                    {
                        dbDeck.Agenda = dbCards[agendas.First()];
                    }
                }

                if (deck["slots"]!.ToJsonString() != "[]")
                {
                    var cardsObject = deck["slots"]!.AsObject();
                    if (cardsObject != null)
                    {
                        var cards = cardsObject.Deserialize<Dictionary<string, int>>();

                        foreach (var (code, count) in cards!)
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
                }
            }

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
                    new KeyValuePair<string, string>("client_id", thronesDbOptions.ClientId),
                    new KeyValuePair<string, string>("client_secret", thronesDbOptions.ClientSecret),
                    new KeyValuePair<string, string>("grant_type", "refresh_token"),
                    new KeyValuePair<string, string>("refresh_token", token.RefreshToken)
                };

            using var content = new FormUrlEncodedContent(request);
            content.Headers.ContentType = new MediaTypeHeaderValue("application/x-www-form-urlencoded");

            var response = await httpClient.PostAsync("https://thronesdb.com/oauth/v2/token", content, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {

            }

            var tokenResponse = await response.Content.ReadFromJsonAsync<TokenResponse>(jsonOptions, cancellationToken);

            if (tokenResponse == null || tokenResponse.AccessToken == null || tokenResponse.RefreshToken == null)
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
}
