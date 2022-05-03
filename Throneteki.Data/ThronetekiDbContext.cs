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
}