using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Throneteki.Data;
using Throneteki.Data.Models;

namespace Throneteki.Web;

public class DataInitialisationWorker : IHostedService
{
    private readonly IServiceProvider _serviceProvider;

    public DataInitialisationWorker(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();

        var context = scope.ServiceProvider.GetRequiredService<ThronetekiDbContext>();
        if ((await context.Database.GetPendingMigrationsAsync(cancellationToken)).Any())
        {
            await context.Database.MigrateAsync(cancellationToken);
        }

        await SetupFactions(scope, cancellationToken);
    }

    private static async Task SetupFactions(IServiceScope scope, CancellationToken cancellationToken = default)
    {
        var context = scope.ServiceProvider.GetRequiredService<ThronetekiDbContext>();
        await AddFactionIfNotExists(context, "baratheon", "House Baratheon", cancellationToken);
        await AddFactionIfNotExists(context, "greyjoy", "House Greyjoy", cancellationToken);
        await AddFactionIfNotExists(context, "lannister", "House Lannister", cancellationToken);
        await AddFactionIfNotExists(context, "martell", "House Martell", cancellationToken);
        await AddFactionIfNotExists(context, "neutral", "Neutral", cancellationToken);
        await AddFactionIfNotExists(context, "stark", "House Stark", cancellationToken);
        await AddFactionIfNotExists(context, "targaryen", "House Targaryen", cancellationToken);
        await AddFactionIfNotExists(context, "thenightswatch", "The Night\'s Watch", cancellationToken);
        await AddFactionIfNotExists(context, "tyrell", "House Tyrell", cancellationToken);
    }

    private static async Task AddFactionIfNotExists(ThronetekiDbContext context, string factionCode, string factionName, CancellationToken cancellationToken = default)
    {
        if (!await context.Factions!.AnyAsync(f => f.Code == factionCode, cancellationToken))
        {
            context.Factions!.Add(new Faction
            {
                Code = factionCode,
                Name = factionName
            });

            await context.SaveChangesAsync(cancellationToken);
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}