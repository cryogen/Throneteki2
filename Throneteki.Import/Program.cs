using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using StackExchange.Redis;
using Throneteki.Data;
using Throneteki.Import;
using Throneteki.Models.Mapping;

using var host = Host.CreateDefaultBuilder(args)
    .ConfigureServices((context, services) =>
    {
        services.AddHostedService<ThronetekiDataImporter>();
        services.AddDbContext<ThronetekiDbContext>(options =>
        {
            options.UseNpgsql(context.Configuration.GetConnectionString("DefaultConnection")).UseSnakeCaseNamingConvention();
        });

        services.AddSingleton<IConnectionMultiplexer>(provider =>
            ConnectionMultiplexer.Connect(context.Configuration["Settings:RedisUrl"] ?? throw new InvalidOperationException()));

        services.AddAutoMapper(typeof(LobbyMappingProfile).Assembly);
    })
    .Build();

await host.RunAsync();