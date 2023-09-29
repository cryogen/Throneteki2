using System.ComponentModel.DataAnnotations.Schema;

namespace Throneteki.Data.Models;

public class BlocklistEntry
{
    public Guid Id { get; set; }
    [ForeignKey(nameof(ThronetekiUser))]
    public string? ThronetekiUserId { get; set; }
    public ThronetekiUser? ThronetekiUser { get; set; }
    [ForeignKey(nameof(BlockedUser))]
    public string? BlockedUserId { get; set; }

    public ThronetekiUser? BlockedUser { get; set; }
}