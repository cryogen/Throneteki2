using Grpc.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Throneteki.Data;

namespace Throneteki.WebService.Services;

[Authorize]
public class UserServiceImpl : UserService.UserServiceBase
{
    private readonly ThronetekiDbContext dbContext;

    public UserServiceImpl(ThronetekiDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public override async Task<GetUserByUsernameResponse> GetUserByUsername(GetUserByUsernameRequest request, ServerCallContext context)
    {
        var ret = new GetUserByUsernameResponse();

        var user = await dbContext.Users
            .Include(u => u.ProfileImage)
            .FirstOrDefaultAsync(u => u.UserName == request.Username);

        if (user == null)
        {
            return ret;
        }

        ret.User = new ThronetekiUser
        {
            Avatar = (user.ProfileImage != null ? $"data:image/png;base64,{Convert.ToBase64String(user.ProfileImage.Image)}" : null) ?? string.Empty,
            Id = user.Id,
            Username = user.UserName
        };

        return ret;
    }
}