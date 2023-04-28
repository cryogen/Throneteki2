using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Throneteki.Data.Converters;
using Throneteki.Data.Models;

namespace Throneteki.Data.Configurations;

public class DeckConfiguration : IEntityTypeConfiguration<Deck>
{
    public void Configure(EntityTypeBuilder<Deck> builder)
    {
        builder.HasOne(d => d.Faction).WithMany().OnDelete(DeleteBehavior.NoAction);
        builder.Property(deck => deck.Created).HasConversion<DateTimeConverter>();
        builder.Property(deck => deck.Updated).HasConversion<DateTimeConverter>();
    }
}