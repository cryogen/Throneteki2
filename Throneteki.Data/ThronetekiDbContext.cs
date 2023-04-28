using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using OpenIddict.EntityFrameworkCore.Models;
using Throneteki.Data.Models;

namespace Throneteki.Data;

public class ThronetekiDbContext : IdentityDbContext<ThronetekiUser, ThronetekiRole, string, IdentityUserClaim<string>, ThronetekiUserRole,
    IdentityUserLogin<string>, IdentityRoleClaim<string>, IdentityUserToken<string>>
{
    public DbSet<Card> Cards => Set<Card>();
    public DbSet<Deck> Decks => Set<Deck>();
    public DbSet<Faction> Factions => Set<Faction>();
    public DbSet<LobbyMessage> LobbyMessages => Set<LobbyMessage>();
    public DbSet<Pack> Packs => Set<Pack>();

    public ThronetekiDbContext()
    {
    }

    public ThronetekiDbContext(DbContextOptions<ThronetekiDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(ThronetekiDbContext).Assembly);

        builder.Entity<IdentityUserToken<string>>().ToTable("user_tokens");
        builder.Entity<IdentityUserLogin<string>>().ToTable("user_logins");
        builder.Entity<IdentityUserClaim<string>>().ToTable("user_claims");

        builder.Entity<ThronetekiUserRole>().ToTable("user_roles");
        builder.Entity<IdentityRoleClaim<string>>().ToTable("role_claims");

        builder.Entity<OpenIddictEntityFrameworkCoreScope>().ToTable("open_iddict_scopes");
        builder.Entity<OpenIddictEntityFrameworkCoreToken>().ToTable("open_iddict_tokens");
        builder.Entity<OpenIddictEntityFrameworkCoreAuthorization>().ToTable("open_iddict_authorizations");
        builder.Entity<OpenIddictEntityFrameworkCoreApplication>().ToTable("open_iddict_applications");

        builder.Entity<BlocklistEntry>().ToTable("blocklist_entries");
        builder.Entity<ExternalToken>().ToTable("external_tokens");
        builder.Entity<ProfileImage>().ToTable("profile_images");
    }
}