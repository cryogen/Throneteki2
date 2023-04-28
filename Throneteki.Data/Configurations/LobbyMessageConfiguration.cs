using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Throneteki.Data.Converters;
using Throneteki.Data.Models;

namespace Throneteki.Data.Configurations;

public class LobbyMessageConfiguration : IEntityTypeConfiguration<LobbyMessage>
{
    public void Configure(EntityTypeBuilder<LobbyMessage> builder)
    {
        builder.Property(m => m.PostedDateTime).HasConversion<DateTimeConverter>();
    }
}