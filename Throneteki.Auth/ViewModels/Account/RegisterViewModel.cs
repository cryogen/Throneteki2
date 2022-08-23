using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authentication;

namespace Throneteki.Auth.ViewModels.Account;

public class RegisterViewModel
{
    [Required]
    [EmailAddress]
    [Display(Name = "Email")]
    public string Email { get; set; } = null!;

    [Required]
    [Display(Name = "Username")]
    [StringLength(15, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 3)]
    [RegularExpression(@"^[A-Za-z0-9_-]+$", ErrorMessage = "Usernames must only use the characters a-z, 0-9, _ and -.")]
    public string Username { get; set; } = null!;

    [Required]
    [MinLength(7)]
    [DataType(DataType.Password)]
    [Display(Name = "Password")]
    public string Password { get; set; } = null!;

    [DataType(DataType.Password)]
    [Display(Name = "Confirm password")]
    [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
    public string ConfirmPassword { get; set; } = null!;

    public string? ReturnUrl { get; set; }

    public IList<AuthenticationScheme> ExternalLogins { get; set; } = new List<AuthenticationScheme>();
}