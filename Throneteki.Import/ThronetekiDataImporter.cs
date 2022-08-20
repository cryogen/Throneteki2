using System.Globalization;
using JorgeSerrano.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Net.Http.Json;
using System.Text.Json;
using Throneteki.Data;
using Throneteki.Data.Models;
using Throneteki.Import.Models;

namespace Throneteki.Import
{
    public class ThronetekiDataImporter : IHostedService
    {
        private readonly IServiceProvider serviceProvider;
        private readonly ILogger<ThronetekiDataImporter> logger;
        private readonly IHostApplicationLifetime lifeTime;
        private readonly string imagePath;

        public ThronetekiDataImporter(IServiceProvider serviceProvider, ILogger<ThronetekiDataImporter> logger, IHostApplicationLifetime lifeTime, IConfiguration configuration)
        {
            this.serviceProvider = serviceProvider;
            this.logger = logger;
            this.lifeTime = lifeTime;

            imagePath = configuration.GetValue<string>("Settings:ImagePath");
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            logger.LogInformation("Starting importing data");

            using var scope = serviceProvider.CreateScope();

            var context = scope.ServiceProvider.GetRequiredService<ThronetekiDbContext>();

            var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = new JsonSnakeCaseNamingPolicy() };

            HttpClient httpClient = new();

            httpClient.BaseAddress = new Uri("https://thronesdb.com/api/");

            logger.LogInformation("Fetching packs from ThronesDB");

            var packs = await httpClient.GetFromJsonAsync<IEnumerable<ThronesDbPack>>("public/packs", jsonOptions, cancellationToken);
            if (packs == null)
            {
                logger.LogError("Failed to fetch packs, aborting");

                return;
            }

            logger.LogInformation("Finished fetching packs, importing...");

            var dbPacks = await context.Packs.ToDictionaryAsync(k => k.Code, v => v, cancellationToken);

            foreach (var pack in packs)
            {
                if (pack.Code == null)
                {
                    logger.LogWarning("Null pack code encountered, skipping");
                    continue;
                }

                if (!dbPacks.TryGetValue(pack.Code, out var dbPack))
                {
                    dbPack = new Pack();
                    context.Packs.Add(dbPack);
                    dbPacks[pack.Code] = dbPack;
                }

                dbPack.Code = pack.Code;
                dbPack.Name = pack.Name;
                dbPack.ReleaseDate = string.IsNullOrEmpty(pack.Available) ? null : new DateTime(DateTime.Parse(pack.Available).Date.Ticks, DateTimeKind.Utc);
            }

            await context.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Packs imported, fetching cards");
            var cards = await httpClient.GetFromJsonAsync<IEnumerable<ThronesDbCard>>("public/cards", jsonOptions, cancellationToken);
            if (cards == null)
            {
                logger.LogError("Failed to fetch cards, aborting");

                return;
            }

            var dbCards = await context.Cards.ToDictionaryAsync(k => k.Code, v => v, cancellationToken);
            var dbFactions = await context.Factions.ToDictionaryAsync(k => k.Code, v => v, cancellationToken);

            logger.LogInformation("Cards fetched, importing...");

            foreach (var card in cards)
            {
                if (card.Code == null)
                {
                    logger.LogWarning("Null card code encountered, skipping");
                    continue;
                }

                if (card.PackCode == null)
                {
                    logger.LogError("Card {cardCode} had empty pack code, ignoring", card.Code);
                    continue;
                }

                if (card.FactionCode == null)
                {
                    logger.LogError("Card {cardCode} has empty faction code, ignoring", card.Code);
                    continue;
                }

                if (!dbCards.TryGetValue(card.Code, out var dbCard))
                {
                    dbCard = new Card();
                    context.Cards.Add(dbCard);
                    dbCards[card.Code] = dbCard;
                }

                dbCard.Code = card.Code;
                dbCard.Cost = card.Cost.GetValueOrDefault(0);
                dbCard.DeckLimit = card.DeckLimit;
                dbCard.FactionId = dbFactions[card.FactionCode].Id;
                dbCard.Flavor = card.Flavor;
                dbCard.ImageUrl = card.ImageUrl;
                dbCard.Income = card.Income;
                dbCard.Initiative = card.Initiative;
                dbCard.Intrigue = card.IsIntrigue;
                dbCard.Illustrator = card.Illustrator;
                dbCard.Label = card.Label;
                dbCard.Loyal = card.IsLoyal;
                dbCard.Military = card.IsMilitary;
                dbCard.Name = card.Name;
                dbCard.PackId = dbPacks[card.PackCode].Id;
                dbCard.Power = card.IsPower;
                dbCard.Text = card.Text;
                dbCard.Type = card.TypeCode;
                dbCard.Unique = card.IsUnique;
                dbCard.Strength = card.Strength;
                dbCard.Traits = string.Join(",", card.Traits.Split(".", StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries));
                dbCard.Unique = card.IsUnique;
            }

            await context.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Card import done, fetching images");

            foreach (var card in dbCards.Values)
            {
                if (!File.Exists($"{Path.Combine(imagePath, card.Code)}.png") && card.ImageUrl != null)
                {
                    logger.LogInformation("Downloading image for {cardLabel} from {url}", card.Label, card.ImageUrl);
                    using var imageStream = await httpClient.GetStreamAsync(card.ImageUrl, cancellationToken);
                    using var file = File.OpenWrite($"{Path.Combine(imagePath, card.Code)}.png");
                    await imageStream.CopyToAsync(file, cancellationToken);
                }
            }

            logger.LogInformation(imagePath);

            lifeTime.StopApplication();
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            logger.LogInformation("Finished importing data");

            return Task.CompletedTask;
        }
    }
}
