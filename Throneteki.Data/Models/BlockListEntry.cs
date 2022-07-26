namespace Throneteki.Data.Models;

public class BlockListEntry
{
    public Guid Id { get; set; }
    public string? ThronetekiUserId { get; set; }
    public ThronetekiUser? ThronetekiUser { get; set; }
    public string? BlockedUserId { get; set; }
    public ThronetekiUser? BlockedUser { get; set; }
}