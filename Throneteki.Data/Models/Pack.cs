using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace Throneteki.Data.Models;

[Index(nameof(Code), IsUnique = true)]
public class Pack
{
    public int Id { get; set; }

    [Required]
    public string Code { get; set; } = null!;

    public string? Name { get; set; }
    public DateTime? ReleaseDate { get; set; }
    public ICollection<Card> Cards { get; set; } = new List<Card>();
}