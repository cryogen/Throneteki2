using Microsoft.AspNetCore.Identity;

namespace Throneteki.Data.Models;

public class ThronetekiRole : IdentityRole
{
    public virtual ICollection<ThronetekiUserRole> UserRoles { get; set; } = null!;
}