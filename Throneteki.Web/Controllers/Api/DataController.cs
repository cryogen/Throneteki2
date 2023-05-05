using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Throneteki.Data;
using Throneteki.Models.Services;

namespace Throneteki.Web.Controllers.Api;

[ApiController]
public class DataController : ControllerBase
{
    private readonly ThronetekiDbContext context;
    private readonly CardService cardService;

    public DataController(ThronetekiDbContext context, CardService cardService)
    {
        this.context = context;
        this.cardService = cardService;
    }

    [HttpGet("/api/data/factions")]
    public async Task<IActionResult> GetFactions(CancellationToken cancellationToken)
    {
        return Ok(await context.Factions.ToListAsync(cancellationToken));
    }

    [HttpGet("/api/data/packs")]
    public async Task<IActionResult> GetPacks(CancellationToken cancellationToken)
    {
        return Ok(await context.Packs.ToListAsync(cancellationToken));
    }

    [HttpGet("/api/data/restricted-list")]
    public async Task<IActionResult> GetRestrictedList(CancellationToken cancellationToken)
    {
        return Ok(await cardService.GetRestrictedLists());
    }

    [HttpGet("/api/data/cards")]
    public async Task<IActionResult> GetCards(CancellationToken cancellationToken)
    {
        var excludedPackCodes = new List<string>
        {
            "VDS",
            "VHotK",
            "VKm"
        };

        return Ok(await context.Cards
            .Include(c => c.Faction)
            .Include(c => c.Pack)
            .Where(card => !excludedPackCodes.Contains(card.Pack.Code))
            .Select(card => new
            {
                card.Id,
                card.Code,
                card.Type,
                card.Name,
                card.Unique,
                Faction = new
                {
                    card.Faction.Code,
                    card.Faction.Name
                },
                card.Loyal,
                card.Cost,
                card.Strength,
                card.Text,
                card.Flavor,
                card.DeckLimit,
                card.Illustrator,
                PackCode = card.Pack.Code,
                card.Label,
                Icons = new
                {
                    card.Military,
                    card.Intrigue,
                    card.Power
                },
                Traits = card.Traits != null ? card.Traits.Split(",", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries) : Array.Empty<string>(),
                card.Income,
                card.Claim,
                card.Reserve,
                card.Initiative
            })
            .ToListAsync(cancellationToken));
    }
}