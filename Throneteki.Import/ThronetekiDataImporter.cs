using JorgeSerrano.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Net.Http.Json;
using System.Text.Json;
using AutoMapper;
using Throneteki.Data;
using Throneteki.Data.Models;
using Throneteki.Import.Models;
using Throneteki.Models.Models;

namespace Throneteki.Import;

public class ThronetekiDataImporter : IHostedService
{
    private readonly IDatabase _database;
    private readonly string _imagePath;
    private readonly IHostApplicationLifetime _lifeTime;
    private readonly ILogger<ThronetekiDataImporter> _logger;
    private readonly IMapper _mapper;
    private readonly IServiceProvider _serviceProvider;

    public ThronetekiDataImporter(IServiceProvider serviceProvider, ILogger<ThronetekiDataImporter> logger, IHostApplicationLifetime lifeTime, IConfiguration configuration,
        IConnectionMultiplexer connectionMultiplexer, IMapper mapper)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _lifeTime = lifeTime;
        _mapper = mapper;
        _database = connectionMultiplexer.GetDatabase();

        _imagePath = configuration.GetValue<string>("Settings:ImagePath");
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting importing data");

        using var scope = _serviceProvider.CreateScope();

        var context = scope.ServiceProvider.GetRequiredService<ThronetekiDbContext>();

        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = new JsonSnakeCaseNamingPolicy() };

        HttpClient httpClient = new()
        {
            BaseAddress = new Uri("https://thronesdb.com/api/")
        };

        _logger.LogInformation("Fetching packs from ThronesDB");

        var packs = await httpClient.GetFromJsonAsync<IEnumerable<ThronesDbPack>>("public/packs", jsonOptions, cancellationToken);
        if (packs == null)
        {
            _logger.LogError("Failed to fetch packs, aborting");

            return;
        }

        _logger.LogInformation("Finished fetching packs, importing...");

        var dbPacks = await context.Packs.ToDictionaryAsync(k => k.Code, v => v, cancellationToken);

        foreach (var pack in packs)
        {
            if (pack.Code == null)
            {
                _logger.LogWarning("Null pack code encountered, skipping");
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

        _logger.LogInformation("Packs imported, fetching cards");
        var cards = await httpClient.GetFromJsonAsync<IEnumerable<ThronesDbCard>>("public/cards", jsonOptions, cancellationToken);
        if (cards == null)
        {
            _logger.LogError("Failed to fetch cards, aborting");

            return;
        }

        var dbCards = await context.Cards.ToDictionaryAsync(k => k.Code, v => v, cancellationToken);
        var dbFactions = await context.Factions.ToDictionaryAsync(k => k.Code, v => v, cancellationToken);

        _logger.LogInformation("Cards fetched, importing...");

        foreach (var card in cards)
        {
            if (card.Code == null)
            {
                _logger.LogWarning("Null card code encountered, skipping");
                continue;
            }

            if (card.PackCode == null)
            {
                _logger.LogError("Card {cardCode} had empty pack code, ignoring", card.Code);
                continue;
            }

            if (card.FactionCode == null)
            {
                _logger.LogError("Card {cardCode} has empty faction code, ignoring", card.Code);
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
            dbCard.Claim = card.Claim;
            dbCard.Reserve = card.Reserve;
        }

        await context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Card import done, fetching images");

        await Parallel.ForEachAsync(dbCards.Values.Where(card => !File.Exists($"{Path.Combine(_imagePath, card.Code)}.png") && card.ImageUrl != null),
            new ParallelOptions { CancellationToken = cancellationToken, MaxDegreeOfParallelism = 5 }, async (card, token) =>
            {
                _logger.LogInformation("Downloading image for {cardLabel} from {url}", card.Label, card.ImageUrl);
                await using var imageStream = await httpClient.GetStreamAsync(card.ImageUrl, token);
                await using var file = File.OpenWrite($"{Path.Combine(_imagePath, card.Code)}.png");
                await imageStream.CopyToAsync(file, token);
            });

        _logger.LogInformation(_imagePath);

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        dbPacks = await context.Packs.ToDictionaryAsync(k => k.Code, v => v, cancellationToken);
        await _database.StringSetAsync("data:packs", JsonSerializer.Serialize(dbPacks.Values.Select(_mapper.Map<LobbyPack>), options));

        dbCards = await context.Cards.ToDictionaryAsync(k => k.Code, v => v, cancellationToken);
        await _database.StringSetAsync("data:cards", JsonSerializer.Serialize(
            dbCards.ToDictionary(k => k.Key, v => _mapper.Map<LobbyCard>(v.Value)), options));

        _lifeTime.StopApplication();
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Finished importing data");

        return Task.CompletedTask;
    }
}