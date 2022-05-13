using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OpenIddict.Abstractions;
using Throneteki.Data;
using Throneteki.Data.Models;

namespace Throneteki.Web.Helpers;

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
        var claimType = OpenIddictConstants.Claims.Picture;
        if (!principal.HasClaim(claim => claim.Type == claimType) && user.ProfileImage != null)
        {
            claimsIdentity.AddClaim(new Claim(claimType, Convert.ToBase64String(user.ProfileImage.Image)));
        }

        principal.AddIdentity(claimsIdentity);

        return principal;
    }
}