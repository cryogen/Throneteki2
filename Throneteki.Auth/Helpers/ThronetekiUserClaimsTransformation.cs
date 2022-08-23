using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using OpenIddict.Abstractions;
using Throneteki.Data;

namespace Throneteki.Auth.Helpers;

public class ThronetekiUserClaimsTransformation : IClaimsTransformation
{
    private readonly ThronetekiDbContext dbContext;

    public ThronetekiUserClaimsTransformation(ThronetekiDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity == null)
        {
            return principal;
        }

        var user = await dbContext.Users.Include(u => u.ProfileImage).SingleOrDefaultAsync(u => u.UserName == principal.Identity.Name);
        var claimsIdentity = new ClaimsIdentity();
        if (!principal.HasClaim(claim => claim.Type == OpenIddictConstants.Claims.Picture) && user?.ProfileImage != null)
        {
            claimsIdentity.AddClaim(new Claim(OpenIddictConstants.Claims.Picture, Convert.ToBase64String(user.ProfileImage.Image)));
        }

        principal.AddIdentity(claimsIdentity);

        return principal;
    }
}