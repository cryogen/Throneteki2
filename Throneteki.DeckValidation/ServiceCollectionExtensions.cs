using Microsoft.Extensions.DependencyInjection;

namespace Throneteki.DeckValidation;

public static class ServiceCollectionExtensions
{
    public static void AddDeckValidation(this IServiceCollection services)
    {
        services.AddTransient<DeckValidator>();
    }
}