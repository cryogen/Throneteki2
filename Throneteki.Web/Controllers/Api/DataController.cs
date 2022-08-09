using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Throneteki.Data;

namespace Throneteki.Web.Controllers.Api
{
    [ApiController]
    public class DataController : ControllerBase
    {
        private readonly ThronetekiDbContext context;

        public DataController(ThronetekiDbContext context)
        {
            this.context = context;
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

        [HttpGet("/api/data/cards")]
        public async Task<IActionResult> GetCards(CancellationToken cancellationToken)
        {
            return Ok((await context.Cards
                    .Include(c => c.Faction)
                    .Include(c => c.Pack)
                    .ToListAsync(cancellationToken))
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
                    Traits = card.Traits?.Split(",", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
                    card.Income,
                    card.Claim,
                    card.Reserve
                }));
        }
    }
}
