using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using Throneteki.Auth.Helpers;
using Throneteki.Auth.ViewModels.Account;
using Throneteki.Data.Models;

namespace Throneteki.Auth.Controllers;

public class AccountController : Controller
{
    private readonly SignInManager<ThronetekiUser> _signInManager;
    private readonly UserManager<ThronetekiUser> _userManager;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<AccountController> _logger;

    public AccountController(SignInManager<ThronetekiUser> signInManager, UserManager<ThronetekiUser> userManager, IHttpClientFactory httpClientFactory,
        ILogger<AccountController> logger)
    {
        _signInManager = signInManager;
        _userManager = userManager;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Login(string? returnUrl)
    {
        var errorMessage = TempData["ErrorMessage"] as string;

        if (!string.IsNullOrEmpty(errorMessage))
        {
            ModelState.AddModelError(string.Empty, errorMessage);
        }

        returnUrl ??= Url.Content("~/");

        await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);

        var model = new LoginViewModel
        {
            ExternalLogins = (await _signInManager.GetExternalAuthenticationSchemesAsync()).ToList(),
            ReturnUrl = returnUrl
        };

        return View(model);
    }

    [HttpPost]
    public async Task<IActionResult> Login(LoginViewModel model, string? returnUrl)
    {
        returnUrl ??= Url.Content("~/");

        model.ExternalLogins = (await _signInManager.GetExternalAuthenticationSchemesAsync()).ToList();

        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var result = await _signInManager.PasswordSignInAsync(model.Username, model.Password, model.RememberMe, true);
        if (result.Succeeded)
        {
            _logger.LogInformation("User {username} logged in.", model.Username);
            return LocalRedirect(returnUrl);
        }

        if (result.RequiresTwoFactor)
        {
            return RedirectToPage("./LoginWith2fa", new { ReturnUrl = returnUrl, model.RememberMe });
        }

        if (result.IsLockedOut)
        {
            _logger.LogWarning("User account locked out.");
            return RedirectToPage("./Lockout");
        }

        ModelState.AddModelError(string.Empty, "Invalid username/password.");
        return View(model);
    }

    [HttpGet]
    public async Task<IActionResult> Register(string? returnUrl)
    {
        var model = new RegisterViewModel
        {
            ReturnUrl = returnUrl,
            ExternalLogins = (await _signInManager.GetExternalAuthenticationSchemesAsync()).ToList()
        };

        return View(model);
    }

    [HttpPost]
    public async Task<IActionResult> Register(RegisterViewModel model, string? returnUrl = null)
    {
        returnUrl ??= Url.Content("~/");
        model.ExternalLogins = (await _signInManager.GetExternalAuthenticationSchemesAsync()).ToList();
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var user = new ThronetekiUser { UserName = model.Username, Email = model.Email, RegisteredDateTime = DateTime.UtcNow };
        var result = await _userManager.CreateAsync(user, model.Password);
        if (result.Succeeded)
        {
            _logger.LogInformation("User created a new account with password.");

            /*
            var code = await userManager.GenerateEmailConfirmationTokenAsync(user);
            code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
            var callbackUrl = Url.Page(
                "/Account/ConfirmEmail",
                pageHandler: null,
                values: new { area = "Identity", userId = user.Id, code = code, returnUrl = returnUrl },
                protocol: Request.Scheme);

            await emailSender.SendEmailAsync(model.Email, "Confirm your email",
                    $"Please confirm your account by <a href='{HtmlEncoder.Default.Encode(callbackUrl)}'>clicking here</a>.");*/

            var httpClient = _httpClientFactory.CreateClient();
            var stringToHash = StringUtilities.GetRandomString(32);
            var profileImage = new ProfileImage
            {
                Image = await httpClient.GetByteArrayAsync(new Uri($"https://www.gravatar.com/avatar/{stringToHash}?d=identicon&s=24"))
            };

            user.ProfileImage = profileImage;

            await _userManager.UpdateAsync(user);

            if (_userManager.Options.SignIn.RequireConfirmedAccount)
            {
                return RedirectToPage("RegisterConfirmation", new { email = model.Email, returnUrl });
            }

            await _signInManager.SignInAsync(user, false);
            return LocalRedirect(returnUrl);
        }

        foreach (var error in result.Errors)
        {
            ModelState.AddModelError(string.Empty, error.Description);
        }

        return View(model);
    }

    [HttpGet]
    public async Task<IActionResult> Profile(string? returnUrl)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return NotFound();
        }

        return View(new ProfileViewModel
        {
            Username = user.UserName,
            Email = user.Email
        });
    }

    [HttpPost]
    public async Task<IActionResult> Profile(string? returnUrl, ProfileViewModel model)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return NotFound();
        }

        user = await _userManager.Users.Include(u => u.ProfileImage).SingleOrDefaultAsync(u => u.Id == user.Id);
        if (user == null)
        {
            return NotFound();
        }

        if (!ModelState.IsValid)
        {
            return View(model);
        }

        if (user.UserName != model.Username)
        {
            await _userManager.SetUserNameAsync(user, model.Username);
        }

        if (user.Email != model.Email)
        {
            // XXX Send confirmation email here if configured
            await _userManager.SetEmailAsync(user, model.Email);
        }

        if (model.Avatar != null)
        {
            try
            {
                var imageStream = model.Avatar.OpenReadStream();
                var resizedStream = new MemoryStream();
                using var image = await Image.LoadAsync(imageStream);

                image.Mutate(img => img.Resize(new Size(32, 32), KnownResamplers.Bicubic, true));

                await image.SaveAsPngAsync(resizedStream);

                var profileImage = user.ProfileImage ?? new ProfileImage();

                profileImage.Image = resizedStream.ToArray();

                user.ProfileImage = profileImage;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to save profile picture for user {username}", user.UserName);
                ModelState.AddModelError(string.Empty, "Invalid image file");
            }
        }

        await _userManager.UpdateAsync(user);

        return Ok(new
        {
            Success = true
        });
    }
}