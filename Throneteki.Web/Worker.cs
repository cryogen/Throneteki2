﻿using Microsoft.AspNetCore.Identity;
using OpenIddict.Abstractions;
using Throneteki.Data;
using Throneteki.Data.Models;

namespace Throneteki.Web;

public class Worker : IHostedService
{
    private readonly IServiceProvider serviceProvider;

    public Worker(IServiceProvider serviceProvider)
    {
        this.serviceProvider = serviceProvider;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = serviceProvider.CreateScope();

        var context = scope.ServiceProvider.GetRequiredService<ThronetekiDbContext>();
        await context.Database.EnsureCreatedAsync(cancellationToken);

        var manager = scope.ServiceProvider.GetRequiredService<IOpenIddictApplicationManager>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ThronetekiUser>>();

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

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}