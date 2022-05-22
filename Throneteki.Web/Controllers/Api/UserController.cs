using System.Text.Json;
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
    private readonly IWebHostEnvironment hostEnvironment;

    public UserController(UserManager<ThronetekiUser> userManager, ThronetekiDbContext dbContext, IWebHostEnvironment hostEnvironment)
    {
        this.userManager = userManager;
        this.dbContext = dbContext;
        this.hostEnvironment = hostEnvironment;
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

            user.ProfileImage = profileImage;
        }

        var settings = JsonSerializer.Deserialize<ThronetekiUserSettings>(user.Settings ?? "{}") ?? new ThronetekiUserSettings();

        if (request.CustomBackground != null)
        {
            await using var imageStream = new MemoryStream(Convert.FromBase64String(request.CustomBackground));
            using var image = await Image.LoadAsync(imageStream);
            var bgPath = Path.Combine(hostEnvironment.WebRootPath, "img", "bgs");

            image.Mutate(img => img.Resize(new Size(1280, 720), KnownResamplers.Bicubic, true));

            if (settings.CustomBackgroundUrl != null && System.IO.File.Exists(Path.Combine(bgPath, settings.CustomBackgroundUrl)))
            {
                System.IO.File.Delete(Path.Combine(bgPath, settings.CustomBackgroundUrl));
            }

            var newFile = $"{user.Id}.png";
            settings.CustomBackgroundUrl = newFile;

            Directory.CreateDirectory(bgPath);
            await image.SaveAsync(Path.Combine(bgPath, newFile));
        }

        settings.Background = request.Settings.Background;
        settings.ActionWindows = request.Settings.ActionWindows;

        user.Settings = JsonSerializer.Serialize(settings, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        await userManager.UpdateAsync(user);
        await dbContext.SaveChangesAsync();

        return Ok(new
        {
            Success = true
        });
    }
}