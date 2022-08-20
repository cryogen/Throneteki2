using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authentication;

namespace Throneteki.Auth.ViewModels.Account;

public class LoginViewModel
{
    [Required]
    public string Username { get; set; } = null!;

    [Required]
    [DataType(DataType.Password)]
    public string Password { get; set; } = null!;

    [Display(Name = "Remember me?")]
    public bool RememberMe { get; set; }

    public IList<AuthenticationScheme>? ExternalLogins { get; set; }

    public string? ReturnUrl { get; set; }
    public string? ErrorMessage { get; set; }
}