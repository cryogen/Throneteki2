using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Throneteki.Data.Models;

namespace Throneteki.Data.Configurations;

public class ThronetekiRoleConfiguration : IEntityTypeConfiguration<ThronetekiRole>
{
    public void Configure(EntityTypeBuilder<ThronetekiRole> builder)
    {
        builder.ToTable("roles");
        builder.HasMany(e => e.UserRoles)
            .WithOne(e => e.Role)
            .HasForeignKey(ur => ur.RoleId)
            .IsRequired();
    }
}