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
    private readonly SignInManager<ThronetekiUser> signInManager;
    private readonly UserManager<ThronetekiUser> userManager;
    private readonly IHttpClientFactory httpClientFactory;
    private readonly ILogger<AccountController> logger;

    public AccountController(SignInManager<ThronetekiUser> signInManager, UserManager<ThronetekiUser> userManager, IHttpClientFactory httpClientFactory,
        ILogger<AccountController> logger)
    {
        this.signInManager = signInManager;
        this.userManager = userManager;
        this.httpClientFactory = httpClientFactory;
        this.logger = logger;
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
            ExternalLogins = (await signInManager.GetExternalAuthenticationSchemesAsync()).ToList(),
            ReturnUrl = returnUrl
        };

        return View(model);
    }

    [HttpPost]
    public async Task<IActionResult> Login(LoginViewModel model, string? returnUrl)
    {
        returnUrl ??= Url.Content("~/");

        model.ExternalLogins = (await signInManager.GetExternalAuthenticationSchemesAsync()).ToList();

        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var result = await signInManager.PasswordSignInAsync(model.Username, model.Password, model.RememberMe, true);
        if (result.Succeeded)
        {
            logger.LogInformation($"User {model.Username} logged in.");
            return LocalRedirect(returnUrl);
        }

        if (result.RequiresTwoFactor)
        {
            return RedirectToPage("./LoginWith2fa", new { ReturnUrl = returnUrl, model.RememberMe });
        }

        if (result.IsLockedOut)
        {
            logger.LogWarning("User account locked out.");
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
            ExternalLogins = (await signInManager.GetExternalAuthenticationSchemesAsync()).ToList()
        };

        return View(model);
    }

    [HttpPost]
    public async Task<IActionResult> Register(RegisterViewModel model, string? returnUrl = null)
    {
        returnUrl ??= Url.Content("~/");
        model.ExternalLogins = (await signInManager.GetExternalAuthenticationSchemesAsync()).ToList();
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var user = new ThronetekiUser { UserName = model.Username, Email = model.Email, RegisteredDateTime = DateTime.UtcNow };
        var result = await userManager.CreateAsync(user, model.Password);
        if (result.Succeeded)
        {
            logger.LogInformation("User created a new account with password.");

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

            var httpClient = httpClientFactory.CreateClient();
            var stringToHash = StringUtilities.GetRandomString(32);
            var profileImage = new ProfileImage
            {
                Image = await httpClient.GetByteArrayAsync(new Uri($"https://www.gravatar.com/avatar/{stringToHash}?d=identicon&s=24"))
            };

            user.ProfileImage = profileImage;

            await userManager.UpdateAsync(user);

            if (userManager.Options.SignIn.RequireConfirmedAccount)
            {
                return RedirectToPage("RegisterConfirmation", new { email = model.Email, returnUrl });
            }

            await signInManager.SignInAsync(user, false);
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
        var user = await userManager.GetUserAsync(User);
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
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return NotFound();
        }

        user = await userManager.Users.Include(u => u.ProfileImage).SingleOrDefaultAsync(u => u.Id == user.Id);
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
            await userManager.SetUserNameAsync(user, model.Username);
        }

        if (user.Email != model.Email)
        {
            // XXX Send confirmation email here if configured
            await userManager.SetEmailAsync(user, model.Email);
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
                logger.LogError(ex, $"Failed to save profile picture for user {user.UserName}");
                ModelState.AddModelError(string.Empty, "Invalid image file");
            }
        }

        await userManager.UpdateAsync(user);

        return Ok(new
        {
            Success = true
        });
    }
}