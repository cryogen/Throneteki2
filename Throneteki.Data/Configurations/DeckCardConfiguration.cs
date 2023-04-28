using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Throneteki.Data.Models;

namespace Throneteki.Data.Configurations;

public class DeckCardConfiguration : IEntityTypeConfiguration<DeckCard>
{
    public void Configure(EntityTypeBuilder<DeckCard> builder)
    {
        builder.ToTable("deck_cards");
        builder.HasKey(dc => new { dc.DeckId, dc.CardId });
        builder.HasOne(dc => dc.Deck)
            .WithMany(d => d.DeckCards)
            .HasForeignKey(dc => dc.DeckId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}