using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Throneteki.Data;
using Throneteki.Import;

using var host = Host.CreateDefaultBuilder(args)
    .ConfigureServices((context, services) =>
    {
        services.AddHostedService<ThronetekiDataImporter>();
        services.AddDbContext<ThronetekiDbContext>(options =>
        {
            options.UseNpgsql(context.Configuration.GetConnectionString("DefaultConnection")).UseSnakeCaseNamingConvention();
        });
    })
    .Build();

await host.RunAsync();