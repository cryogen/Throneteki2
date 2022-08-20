using System.ComponentModel.DataAnnotations;

namespace Throneteki.Auth.ViewModels.Authorisation;

public class AuthoriseViewModel
{
    [Display(Name = "Application")]
    public string? ApplicationName { get; set; }

    [Display(Name = "Scope")]
    public string? Scope { get; set; }
}
