using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenIddict.Validation.AspNetCore;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using Throneteki.Data;
using Throneteki.Data.Models;
using Throneteki.Web.Models.User;

namespace Throneteki.Web.Controllers.Api;

[ApiController]
public class UserController : ControllerBase
{
    private readonly UserManager<ThronetekiUser> userManager;
    private readonly ThronetekiDbContext dbContext;

    public UserController(UserManager<ThronetekiUser> userManager, ThronetekiDbContext dbContext)
    {
        this.userManager = userManager;
        this.dbContext = dbContext;
    }

    [HttpPatch("api/user/{userId}")]
    [Authorize(AuthenticationSchemes = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme)]
    public async Task<IActionResult> SaveUser(string userId, SaveUserRequest request)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

        if (User.Identity?.Name != user.UserName)
        {
            return Forbid();
        }

        user = await userManager.Users.Include(u => u.ProfileImage).SingleOrDefaultAsync(u => u.Id == user.Id);
        if (user == null)
        {
            return NotFound();
        }

        if (user.UserName != request.Username)
        {
            await userManager.SetUserNameAsync(user, request.Username);
        }

        if (user.Email != request.Email)
        {
            await userManager.SetEmailAsync(user, request.Email);
        }

        if (request.Avatar != null)
        {
            await using var imageStream = new MemoryStream(Convert.FromBase64String(request.Avatar));
            var resizedStream = new MemoryStream();
            using var image = await Image.LoadAsync(imageStream);

            image.Mutate(img => img.Resize(new Size(32, 32), KnownResamplers.Bicubic, true));

            await image.SaveAsPngAsync(resizedStream);

            var profileImage = user.ProfileImage ?? new ThronetekiUserProfileImage();

            profileImage.Image = resizedStream.ToArray();
        }

        await userManager.UpdateAsync(user);
        await dbContext.SaveChangesAsync();

        return Ok();
    }
}