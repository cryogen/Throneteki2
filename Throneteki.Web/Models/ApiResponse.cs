namespace Throneteki.Web.Models;

public class ApiResponse
{
    public bool Success { get; set; }
    public IReadOnlyCollection<string> Messages { get; set; } = new List<string>();
}