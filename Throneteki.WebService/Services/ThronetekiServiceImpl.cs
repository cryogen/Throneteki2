using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Throneteki.Data;
using Throneteki.Data.Models;
using DbLobbyMessage = Throneteki.Data.Models.LobbyMessage;
using DbThronetekiUser = Throneteki.Data.Models.ThronetekiUser;

namespace Throneteki.WebService.Services;

[Authorize]
public class ThronetekiServiceImpl : LobbyService.LobbyServiceBase
{
    private readonly ThronetekiDbContext dbContext;

    public ThronetekiServiceImpl(ThronetekiDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public override async Task<AddLobbyMessageResponse> AddLobbyMessage(AddLobbyMessageRequest request, ServerCallContext context)
    {
        var poster = await dbContext.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(user => user.Id == request.UserId);

        if (poster == null)
        {
            return new AddLobbyMessageResponse { Message = null };
        }

        var newMessage = new DbLobbyMessage
        {
            Message = request.Message,
            PostedDateTime = DateTime.UtcNow,
            PosterId = poster.Id
        };

        dbContext.LobbyMessages.Add(newMessage);

        await dbContext.SaveChangesAsync();

        return new AddLobbyMessageResponse
        {
            Message = new LobbyMessage
            {
                Id = newMessage.Id,
                Message = newMessage.Message,
                Time = newMessage.PostedDateTime.ToTimestamp(),
                User = new ThronetekiUser
                {
                    Avatar = (poster.ProfileImage != null ? $"data:image/png;base64,{Convert.ToBase64String(poster.ProfileImage.Image)}" : null) ?? string.Empty,
                    Id = poster.Id,
                    Username = poster.UserName,
                    Registered = Timestamp.FromDateTime(DateTime.SpecifyKind(poster.RegisteredDateTime, DateTimeKind.Utc)),
                    Role = GetRoleForUser(poster)
                }
            }
        };
    }

    public override async Task<GetLobbyMessagesForUserResponse> GetLobbyMessagesForUser(GetLobbyMessagesForUserRequest request, ServerCallContext context)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(user => user.Id == request.UserId);
        if (user == null)
        {
            return new GetLobbyMessagesForUserResponse();
        }

        var messages = await dbContext.LobbyMessages
            .Include(m => m.Poster)
            .ThenInclude(p => p.ProfileImage)
            .Include(m => m.Poster)
            .ThenInclude(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .OrderByDescending(m => m.PostedDateTime)
            .Take(50)
            .Select(message => MapMessage(message)).ToListAsync();

        return new GetLobbyMessagesForUserResponse { Messages = { messages } };
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
            Username = user.UserName,
            Registered = Timestamp.FromDateTime(DateTime.SpecifyKind(user.RegisteredDateTime, DateTimeKind.Utc))
        };

        ret.User.BlockList.AddRange(user.BlockListEntries.Select(bl => new BlockListEntry
        {
            UserId = bl.BlockedUserId,
            Username = bl.BlockedUser?.UserName
        }));

        return ret;
    }

    private static LobbyMessage MapMessage(DbLobbyMessage message)
    {
        return new LobbyMessage
        {
            Id = message.Id,
            Message = message.Message,
            Time = DateTime.SpecifyKind(message.PostedDateTime, DateTimeKind.Utc).ToTimestamp(),
            User = new ThronetekiUser
            {
                Avatar = (message.Poster.ProfileImage != null ? $"data:image/png;base64,{Convert.ToBase64String(message.Poster.ProfileImage.Image)}" : null) ?? string.Empty,
                Id = message.Poster.Id,
                Username = message.Poster.UserName,
                Registered = Timestamp.FromDateTime(DateTime.SpecifyKind(message.Poster.RegisteredDateTime, DateTimeKind.Utc)),
                Role = GetRoleForUser(message.Poster)
            }
        };
    }

    private static string GetRoleForUser(DbThronetekiUser user)
    {
        foreach (var userRole in user.UserRoles)
        {
            if (userRole.Role.Name == Roles.Admin)
            {
                return Roles.Admin;
            }

            if (userRole.Role.Name == Roles.Winner)
            {
                return Roles.Winner;
            }

            if (userRole.Role.Name == Roles.PreviousWinner)
            {
                return Roles.PreviousWinner;
            }

            if (userRole.Role.Name == Roles.Contributor)
            {
                return Roles.Contributor;
            }

            if (userRole.Role.Name == Roles.Supporter)
            {
                return Roles.Supporter;
            }
        }

        return "user";
    }
}