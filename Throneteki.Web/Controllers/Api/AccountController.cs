using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Throneteki.Data;
using Throneteki.Data.Models;
using Throneteki.Web.Helpers;
using Throneteki.Web.Models.Account;

namespace Throneteki.Web.Controllers.Api;

[ApiController]
public class AccountController : ControllerBase
{
    private readonly SignInManager<ThronetekiUser> signInManager;
    private readonly IHttpClientFactory httpClientFactory;
    private readonly ThronetekiDbContext context;

    public AccountController(SignInManager<ThronetekiUser> signInManager, IHttpClientFactory httpClientFactory, ThronetekiDbContext context)
    {
        this.signInManager = signInManager;
        this.httpClientFactory = httpClientFactory;
        this.context = context;
    }

    [HttpPost("api/account/login")]
    public async Task<IActionResult> Login(LoginRequest model)
    {
        var result = await signInManager.PasswordSignInAsync(model.Username, model.Password, false, true);
        if (result.Succeeded)
        {
            return Ok(new
            {
                Success = true
            });
        }

        if (result.RequiresTwoFactor)
        {
            throw new NotImplementedException();
        }

        if (result.IsLockedOut)
        {
            throw new NotImplementedException();
        }

        return Ok(new
        {
            Success = false
        });
    }

    [HttpPost("api/account/register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var userManager = signInManager.UserManager;

        var newUser = new ThronetekiUser
        {
            UserName = request.Username,
            Email = request.Email
        };

        if (await userManager.FindByNameAsync(request.Username) != null)
        {
            return Ok(new
            {
                Success = false,
                Message = "An account with that username already exists"
            });
        }

        if (await userManager.FindByEmailAsync(request.Email) != null)
        {
            return Ok(new
            {
                Success = false,
                Message = "An account with that email address already exists"
            });
        }

        var result = await userManager.CreateAsync(newUser, request.Password);
        if (!result.Succeeded)
        {
            return Ok(new
            {
                Success = false,
                Message = result.Errors.Select(e => e.Description)
            });
        }

        var httpClient = httpClientFactory.CreateClient();

        var stringToHash = StringUtilities.GetRandomString(32);

        var profileImage = new ThronetekiUserProfileImage
        {
            Image = await httpClient.GetByteArrayAsync(new Uri($"https://www.gravatar.com/avatar/{stringToHash}?d=identicon&s=24"))
        };

        newUser.ProfileImage = profileImage;

        await context.SaveChangesAsync();

        return Ok(new
        {
            Success = true,
            Message = "Your account has been created successfully"
        });
    }
}