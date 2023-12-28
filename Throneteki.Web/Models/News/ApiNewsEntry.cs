namespace Throneteki.Web.Models.News;

public class ApiNewsEntry
{
    public int Id { get; set; }
    public string Text { get; set; } = null!;
    public DateTime PublishedAt { get; set; }
    public string Publisher { get; set; } = null!;
}