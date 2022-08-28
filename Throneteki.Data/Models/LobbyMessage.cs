using System.ComponentModel.DataAnnotations;

namespace Throneteki.Data.Models;

public class LobbyMessage
{
    public int Id { get; set; }

    [Required]
    public string PosterId { get; set; } = null!;

    public ThronetekiUser Poster { get; set; } = null!;

    [Required]
    public string Message { get; set; } = null!;

    public DateTime PostedDateTime { get; set; }
    public bool Deleted { get; set; }

    public string? DeletedById { get; set; }

    public ThronetekiUser? DeletedBy { get; set; }
}