using System.ComponentModel.DataAnnotations;

namespace Throneteki.Data.Models;

public class ExternalToken
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = null!;

    public ThronetekiUser User { get; set; } = null!;

    [Required]
    public string AccessToken { get; set; } = null!;

    [Required]
    public string RefreshToken { get; set; } = null!;

    [Required]
    public string ExternalId { get; set; } = null!;

    public DateTime Expiry { get; set; }
}