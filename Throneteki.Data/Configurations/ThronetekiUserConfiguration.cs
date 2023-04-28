using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Throneteki.Data.Converters;
using Throneteki.Data.Models;

namespace Throneteki.Data.Configurations;

public class ThronetekiUserConfiguration : IEntityTypeConfiguration<ThronetekiUser>
{
    public void Configure(EntityTypeBuilder<ThronetekiUser> builder)
    {
        builder.ToTable("users");

        builder.HasMany(e => e.UserRoles)
            .WithOne(e => e.User)
            .HasForeignKey(ur => ur.UserId)
            .IsRequired();

        builder.HasMany(user => user.BlockListEntries)
            .WithOne(blockListEntry => blockListEntry.ThronetekiUser)
            .HasForeignKey(blockListEntry => blockListEntry.ThronetekiUserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(u => u.RegisteredDateTime).HasConversion<DateTimeConverter>();
    }
}