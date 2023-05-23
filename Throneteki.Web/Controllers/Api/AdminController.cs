using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenIddict.Validation.AspNetCore;
using Throneteki.Data;
using Throneteki.Data.Models;
using Throneteki.Web.Models.User;

namespace Throneteki.Web.Controllers.Api;

[ApiController]
[Authorize(AuthenticationSchemes = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme)]
[Route("/api/admin/")]
public class AdminController : ControllerBase
{
    private readonly ThronetekiDbContext _dbContext;
    private readonly UserManager<ThronetekiUser> _userManager;

    public AdminController(ThronetekiDbContext dbContext, UserManager<ThronetekiUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
    }

    [HttpGet("user/{username}")]
    [Authorize(Roles = Roles.UserManager)]
    public async Task<IActionResult> GetUser(string username, CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserName == username, cancellationToken);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            Username = user.UserName,
            user.Email,
            user.RegisteredDateTime,
            Permissions = (await _userManager.GetRolesAsync(user)).ToDictionary(k => k, v => true)
        });
    }

    [HttpPatch("user/{userId}")]
    [Authorize(Roles = Roles.UserManager)]
    public async Task<IActionResult> SaveUser(string userId, AdminSaveUserRequest request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(userId);

        user.EmailConfirmed = request.Verified;

        var existingRoles = await _userManager.GetRolesAsync(user);
        var requestRoles = new List<string>();

        foreach (var (role, enabled) in request.Permissions)
        {
            if (enabled)
            {
                requestRoles.Add(role);
            }
        }

        var addedRoles = requestRoles.Except(existingRoles);
        var removedRoles = existingRoles.Except(requestRoles);

        await _userManager.RemoveFromRolesAsync(user, removedRoles);
        await _userManager.AddToRolesAsync(user, addedRoles);

        await _userManager.UpdateAsync(user);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            Success = true
        });
    }
}