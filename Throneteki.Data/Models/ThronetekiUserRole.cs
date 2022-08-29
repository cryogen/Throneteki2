using Microsoft.AspNetCore.Identity;

namespace Throneteki.Data.Models;

public class ThronetekiUserRole : IdentityUserRole<string>
{
    public virtual ThronetekiUser User { get; set; } = null!;
    public virtual ThronetekiRole Role { get; set; } = null!;
}