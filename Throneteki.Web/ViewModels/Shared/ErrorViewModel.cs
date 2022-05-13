using System.ComponentModel.DataAnnotations;

namespace Throneteki.Web.ViewModels.Shared;

public class ErrorViewModel
{
    [Display(Name = "Error")]
    public string? Error { get; set; }

    [Display(Name = "Description")]
    public string? ErrorDescription { get; set; }
}
