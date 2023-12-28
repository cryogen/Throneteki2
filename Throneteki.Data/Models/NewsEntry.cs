using System.ComponentModel.DataAnnotations;

namespace Throneteki.Data.Models;

public class NewsEntry
{
    public int Id { get; set; }
    [Required]
    public string Text { get; set; } = null!;
    [Required]
    public ThronetekiUser PostedBy { get; set; } = null!;
    public DateTime PostedAt { get; set; }
}