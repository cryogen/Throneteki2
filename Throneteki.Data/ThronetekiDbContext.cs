using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Throneteki.Data.Models;

namespace Throneteki.Data;

public class ThronetekiDbContext : IdentityDbContext<ThronetekiUser>
{
    public DbSet<Card> Cards => Set<Card>();
    public DbSet<Deck> Decks => Set<Deck>();
    public DbSet<Faction> Factions => Set<Faction>();
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

        builder
            .Entity<ThronetekiUser>()
            .HasMany(user => user.BlockListEntries)
            .WithOne(blockListEntry => blockListEntry.ThronetekiUser)
            .HasForeignKey(blockListEntry => blockListEntry.ThronetekiUserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Deck>().HasOne(d => d.Faction).WithMany().OnDelete(DeleteBehavior.NoAction);

        builder.Entity<DeckCard>().HasKey(dc => new { dc.DeckId, dc.CardId });
        builder
            .Entity<DeckCard>()
            .HasOne(dc => dc.Deck)
            .WithMany(d => d.DeckCards)
            .HasForeignKey(dc => dc.DeckId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}