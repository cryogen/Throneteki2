using System.ComponentModel.DataAnnotations;
using Throneteki.Auth.Helpers;

namespace Throneteki.Auth.ViewModels.Account;

public class ProfileViewModel
{
    [MaxFileSize(100 * 1024)]
    [AllowedExtensions(new[] { ".jpg", ".jpeg", ".png", ".gif" })]
    public IFormFile? Avatar { get; set; }

    [EmailAddress]
    [Display(Name = "Email")]
    public string? Email { get; set; }

    [Display(Name = "Username")]
    [StringLength(15, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 3)]
    [RegularExpression(@"^[A-Za-z0-9_-]+$", ErrorMessage = "Usernames must only use the characters a-z, 0-9, _ and -.")]
    public string? Username { get; set; }

    [MinLength(7)]
    [DataType(DataType.Password)]
    [Display(Name = "Password")]
    public string? Password { get; set; }

    [DataType(DataType.Password)]
    [Display(Name = "Confirm password")]
    [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
    public string? ConfirmPassword { get; set; }
}