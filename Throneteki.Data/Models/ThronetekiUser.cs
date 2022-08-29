using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace Throneteki.Data.Models;

public class ThronetekiUser : IdentityUser
{
    public ThronetekiUser()
    {
        BlockListEntries = new List<BlocklistEntry>();
    }

    [ForeignKey(nameof(ProfileImage))]
    public Guid? ProfileImageId { get; set; }

    public ProfileImage? ProfileImage { get; set; }
    public string? Settings { get; set; }
    public DateTime RegisteredDateTime { get; set; }
    public ICollection<BlocklistEntry> BlockListEntries { get; init; }
    public ICollection<ExternalToken> ExternalTokens { get; set; } = new List<ExternalToken>();
    public virtual ICollection<ThronetekiUserRole> UserRoles { get; set; } = null!;
}