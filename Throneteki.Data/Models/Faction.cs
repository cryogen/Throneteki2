using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace Throneteki.Data.Models
{
    [Index(nameof(Code), IsUnique = true)]
    public class Faction
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        [Required]
        public string Code { get; set; } = null!;
    }
}
