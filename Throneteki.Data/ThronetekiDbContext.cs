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

        builder.Entity<ThronetekiUser>().ToTable("users");
        builder.Entity<ThronetekiUser>().HasMany(e => e.UserRoles)
            .WithOne(e => e.User)
            .HasForeignKey(ur => ur.UserId)
            .IsRequired();
        builder.Entity<IdentityUserToken<string>>().ToTable("user_tokens");
        builder.Entity<IdentityUserLogin<string>>().ToTable("user_logins");
        builder.Entity<IdentityUserClaim<string>>().ToTable("user_claims");

        builder.Entity<ThronetekiRole>().ToTable("roles");
        builder.Entity<ThronetekiRole>(b =>
        {
            b.HasMany(e => e.UserRoles)
                .WithOne(e => e.Role)
                .HasForeignKey(ur => ur.RoleId)
                .IsRequired();
        });

        builder.Entity<ThronetekiUserRole>().ToTable("user_roles");
        builder.Entity<IdentityRoleClaim<string>>().ToTable("role_claims");

        builder.Entity<OpenIddictEntityFrameworkCoreScope>().ToTable("open_iddict_scopes");
        builder.Entity<OpenIddictEntityFrameworkCoreToken>().ToTable("open_iddict_tokens");
        builder.Entity<OpenIddictEntityFrameworkCoreAuthorization>().ToTable("open_iddict_authorizations");
        builder.Entity<OpenIddictEntityFrameworkCoreApplication>().ToTable("open_iddict_applications");

        builder
            .Entity<ThronetekiUser>()
            .HasMany(user => user.BlockListEntries)
            .WithOne(blockListEntry => blockListEntry.ThronetekiUser)
            .HasForeignKey(blockListEntry => blockListEntry.ThronetekiUserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Deck>().HasOne(d => d.Faction).WithMany().OnDelete(DeleteBehavior.NoAction);

        builder.Entity<DeckCard>().ToTable("deck_cards");
        builder.Entity<DeckCard>().HasKey(dc => new { dc.DeckId, dc.CardId });
        builder
            .Entity<DeckCard>()
            .HasOne(dc => dc.Deck)
            .WithMany(d => d.DeckCards)
            .HasForeignKey(dc => dc.DeckId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<BlocklistEntry>().ToTable("blocklist_entries");
        builder.Entity<ExternalToken>().ToTable("external_tokens");
        builder.Entity<ProfileImage>().ToTable("profile_images");
    }
}