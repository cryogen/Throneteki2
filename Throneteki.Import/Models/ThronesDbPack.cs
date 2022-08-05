namespace Throneteki.Import.Models
{
    public class ThronesDbPack
    {
        public string? Name { get; set; }
        public string? Code { get; set; }
        public int Position { get; set; }
        public int CyclePosition { get; set; }
        public string? Available { get; set; }
        public int Known { get; set; }
        public int Total { get; set; }
        public string? Url { get; set; }
        public DateTime DateUpdate { get; set; }
    }
}
