using System.ComponentModel.DataAnnotations;

namespace Throneteki.Web.ViewModels.Authorization;

public class AuthoriseViewModel
{
    [Display(Name = "Application")]
    public string ApplicationName { get; set; }

    [Display(Name = "Scope")]
    public string Scope { get; set; }
}
