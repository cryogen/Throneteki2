using Grpc.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Throneteki.Data;
using Throneteki.Data.Models;

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
            .Include(u => u.BlockListEntries)
            .ThenInclude(bl => bl.BlockedUser)
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

        ret.User.BlockList.AddRange(user.BlockListEntries.Select(bl => new BlockListEntry
        {
            UserId = bl.BlockedUserId,
            Username = bl.BlockedUser?.UserName
        }));

        return ret;
    }
}