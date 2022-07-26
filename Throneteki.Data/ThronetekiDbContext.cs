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

        builder.Entity<ThronetekiUser>().HasMany(u => u.BlockListEntries).WithOne(bl => bl.BlockedUser).HasForeignKey(bl => bl.BlockedUserId);
    }
}