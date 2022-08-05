using System.ComponentModel.DataAnnotations;

namespace Throneteki.Web.Controllers.Api
{
    public class AddDeckRequest
    {
        [Required]
        public string Name { get; set; } = null!;
        public Dictionary<string, int> PlotCards { get; set; } = new();
        public Dictionary<string, int> DrawCards { get; set; } = new();
        public IEnumerable<int> BannerCards { get; set; } = new List<int>();
        public Dictionary<string, int> RookeryCards { get; set; } = new();
        public int Agenda { get; set; }
        public int Faction { get; set; }

    }
}