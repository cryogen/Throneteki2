using System.ComponentModel.DataAnnotations;

namespace Throneteki.Web.Models.News;

public class AddNewsRequest
{
    [Required]
    public string Text { get; set; } = null!;
}

