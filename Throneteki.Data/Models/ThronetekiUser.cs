using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace Throneteki.Data.Models;

public class ThronetekiUser : IdentityUser
{
    public ThronetekiUser()
    {
        BlockListEntries = new List<BlockListEntry>();
    }

    [ForeignKey(nameof(ProfileImage))]
    public Guid? ProfileImageId { get; set; }
    public ThronetekiUserProfileImage? ProfileImage { get; set; }
    public string? Settings { get; set; }
    public ICollection<BlockListEntry> BlockListEntries { get; init; }
}