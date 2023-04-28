using Microsoft.AspNetCore.Identity;

namespace Throneteki.Data.Models;

public class ThronetekiRole : IdentityRole
{
    public ThronetekiRole()
    {
    }

    public ThronetekiRole(string roleName) : base(roleName)
    {
    }

    public virtual ICollection<ThronetekiUserRole> UserRoles { get; set; } = null!;
}