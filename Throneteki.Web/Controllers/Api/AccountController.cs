using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Throneteki.Data.Models;
using Throneteki.Web.ViewModels.Account;

namespace Throneteki.Web.Controllers.Api;

[ApiController]
public class AccountController : ControllerBase
{
    private readonly SignInManager<ThronetekiUser> signInManager;

    public AccountController(SignInManager<ThronetekiUser> signInManager)
    {
        this.signInManager = signInManager;
    }

    [HttpPost("/api/account/login")]
    public async Task<IActionResult> Login(LoginViewModel model)
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
}