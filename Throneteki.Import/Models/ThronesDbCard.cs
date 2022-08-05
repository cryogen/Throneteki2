namespace Throneteki.Import.Models
{
    public class ThronesDbCard
    {
        public string? PackCode { get; set; }
        public string? TypeCode { get; set; }
        public string? FactionCode { get; set; }
        public int Position { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public int? Cost { get; set; }
        public string? Text { get; set; }
        public int Quantity { get; set; }
        public int? Income { get; set; }
        public int? Initiative { get; set; }
        public int? Claim { get; set; }
        public int? Reserve { get; set; }
        public int DeckLimit { get; set; }
        public string? Designer { get; set; }
        public int? Strength { get; set; }
        public string Traits { get; set; } = null!;
        public string? Flavor { get; set; }
        public string? Illustrator { get; set; }
        public bool IsUnique { get; set; }
        public bool IsLoyal { get; set; }
        public bool IsMilitary { get; set; }
        public bool IsIntrigue { get; set; }
        public bool IsPower { get; set; }
        public bool IsMultiple { get; set; }
        public string? ImageUrl { get; set; }
        public string? Label { get; set; }
    }
}
