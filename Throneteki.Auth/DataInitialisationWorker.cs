using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OpenIddict.Abstractions;
using Throneteki.Data;
using Throneteki.Data.Models;

namespace Throneteki.Auth;

public class DataInitialisationWorker : IHostedService
{
    private readonly IServiceProvider serviceProvider;

    public DataInitialisationWorker(IServiceProvider serviceProvider)
    {
        this.serviceProvider = serviceProvider;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = serviceProvider.CreateScope();

        var context = scope.ServiceProvider.GetRequiredService<ThronetekiDbContext>();
        if ((await context.Database.GetPendingMigrationsAsync(cancellationToken)).Any())
        {
            await context.Database.MigrateAsync(cancellationToken);
        }

        await SetupClients(scope, cancellationToken);
        await SetupScopes(scope, cancellationToken);
        await SetupUsersAndRoles(scope);
    }

    private static async Task SetupUsersAndRoles(IServiceScope scope)
    {
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ThronetekiUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        foreach (var role in Roles.AvailableRoles)
        {
            if (await roleManager.FindByNameAsync(role) is null)
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        if (await userManager.FindByNameAsync("admin") is null)
        {
            var adminUser = new ThronetekiUser
            {
                UserName = "admin",
                Email = "admin@throneteki.net"
            };

            await userManager.CreateAsync(adminUser, "Passw0rd!");
            await userManager.AddToRolesAsync(adminUser, new[] { Roles.UserManager, Roles.PermissionsManager });
        }
    }

    private static async Task SetupScopes(IServiceScope scope, CancellationToken cancellationToken)
    {
        var scopeManager = scope.ServiceProvider.GetRequiredService<IOpenIddictScopeManager>();
        if (await scopeManager.FindByNameAsync("api", cancellationToken) is null)
        {
            await scopeManager.CreateAsync(new OpenIddictScopeDescriptor
            {
                Name = "api",
                Resources =
                {
                    "throneteki"
                }
            }, cancellationToken);
        }

        if (await scopeManager.FindByNameAsync("lobby", cancellationToken) is null)
        {
            await scopeManager.CreateAsync(new OpenIddictScopeDescriptor
            {
                Name = "lobby",
                Resources =
                {
                    "throneteki-lobby"
                }
            }, cancellationToken);
        }

        if (await scopeManager.FindByNameAsync("webservices", cancellationToken) is null)
        {
            await scopeManager.CreateAsync(new OpenIddictScopeDescriptor
            {
                Name = "webservices",
                Resources =
                {
                    "throneteki-webservices"
                }
            }, cancellationToken);
        }
    }

    private async Task SetupClients(IServiceScope scope, CancellationToken cancellationToken)
    {
        var manager = scope.ServiceProvider.GetRequiredService<IOpenIddictApplicationManager>();

        if (await manager.FindByClientIdAsync("throneteki", cancellationToken) is null)
        {
            await manager.CreateAsync(new OpenIddictApplicationDescriptor
            {
                ClientId = "throneteki",
                ConsentType = OpenIddictConstants.ConsentTypes.Implicit,
                DisplayName = "Throneteki Frontend",
                RedirectUris = { new Uri("https://localhost:44460/authentication/login-callback") },
                Permissions =
                {
                    OpenIddictConstants.Permissions.Endpoints.Authorization,
                    OpenIddictConstants.Permissions.Endpoints.Logout,
                    OpenIddictConstants.Permissions.Endpoints.Token,
                    OpenIddictConstants.Permissions.Endpoints.Revocation,
                    OpenIddictConstants.Permissions.GrantTypes.AuthorizationCode,
                    OpenIddictConstants.Permissions.GrantTypes.RefreshToken,
                    OpenIddictConstants.Permissions.ResponseTypes.Code,

                    OpenIddictConstants.Permissions.Scopes.Email,
                    OpenIddictConstants.Permissions.Scopes.Profile,
                    OpenIddictConstants.Permissions.Scopes.Roles,

                    OpenIddictConstants.Permissions.Prefixes.Scope + "api",
                    OpenIddictConstants.Permissions.Prefixes.Scope + "lobby",
                }
            }, cancellationToken);
        }

        if (await manager.FindByClientIdAsync("throneteki-webservices", cancellationToken) is null)
        {
            await manager.CreateAsync(new OpenIddictApplicationDescriptor
            {
                ClientId = "throneteki-webservices",
                ClientSecret = "27EB193C-DDA7-4BE4-9A6B-81A4A04FA2AF",
                DisplayName = "Throneteki Web Services",
                Permissions =
                {
                    OpenIddictConstants.Permissions.Endpoints.Token,
                    OpenIddictConstants.Permissions.GrantTypes.ClientCredentials,
                    OpenIddictConstants.Permissions.Endpoints.Introspection,
                    OpenIddictConstants.Permissions.Prefixes.Scope + "webservices"
                }
            }, cancellationToken);
        }

        if (await manager.FindByClientIdAsync("throneteki-lobby", cancellationToken) is null)
        {
            await manager.CreateAsync(new OpenIddictApplicationDescriptor
            {
                ClientId = "throneteki-lobby",
                ClientSecret = "E4A95BCD-C8F8-45C4-A89A-6F7B62CF840F",
                Permissions =
                {
                    OpenIddictConstants.Permissions.Endpoints.Introspection
                }
            }, cancellationToken);
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}