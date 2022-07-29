using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Throneteki.Data.Models;

namespace Throneteki.Data;

public class ThronetekiDbContext : IdentityDbContext<ThronetekiUser>
{
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
    }
}