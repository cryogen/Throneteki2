using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using AutoMapper;
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
    private readonly IMapper mapper;

    public ThronetekiServiceImpl(ThronetekiDbContext dbContext, IMapper mapper)
    {
        this.dbContext = dbContext;
        this.mapper = mapper;
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
                    Registered = Timestamp.FromDateTime(poster.RegisteredDateTime),
                    Role = GetRoleForUser(poster)
                }
            }
        };
    }

    public override async Task<GetDeckByIdResponse> GetDeckById(GetDeckByIdRequest request, ServerCallContext context)
    {
        var deck = await dbContext.Decks
            .Include(d => d.Faction)
            .Include(d => d.Agenda)
            .ThenInclude(a => a.Faction)
            .Include(d => d.Agenda)
            .ThenInclude(a => a.Pack)
            .Include(d => d.DeckCards)
            .ThenInclude(dc => dc.Card)
            .ThenInclude(c => c.Faction)
            .Include(d => d.DeckCards)
            .ThenInclude(dc => dc.Card)
            .ThenInclude(c => c.Pack)
            .FirstOrDefaultAsync(d => d.Id == request.DeckId);
        if (deck == null)
        {
            return new GetDeckByIdResponse();
        }

        var retDeck = mapper.Map<LobbyDeck>(deck);
        retDeck.DrawCards.AddRange(mapper.Map<IEnumerable<LobbyDeckCard>>(deck.DeckCards.Where(dc => dc.CardType == DeckCardType.Draw)));
        retDeck.PlotCards.AddRange(mapper.Map<IEnumerable<LobbyDeckCard>>(deck.DeckCards.Where(dc => dc.CardType == DeckCardType.Plot)));
        if (deck.Agenda != null)
        {
            retDeck.Agendas.Add(mapper.Map<LobbyCard>(deck.Agenda));
        }

        retDeck.Agendas.AddRange(mapper.Map<IEnumerable<LobbyCard>>(deck.DeckCards.Where(dc => dc.CardType == DeckCardType.Banner).Select(dc => dc.Card)));

        return new GetDeckByIdResponse
        {
            Deck = retDeck
        };
    }

    [SuppressMessage("ReSharper", "SimplifyLinqExpressionUseAll")]
    public override async Task<GetLobbyMessagesForUserResponse> GetLobbyMessagesForUser(GetLobbyMessagesForUserRequest request, ServerCallContext context)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(user => user.Id == request.UserId);

        var messages = await dbContext.LobbyMessages
            .Include(m => m.Poster)
            .ThenInclude(p => p.ProfileImage)
            .Include(m => m.Poster)
            .ThenInclude(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .OrderByDescending(m => m.PostedDateTime)
            .Take(50)
            .Select(message => MapMessage(message)).ToListAsync();

        if (user != null)
        {
            messages = messages.Where(m => !user.BlockListEntries.Any(bl => bl.BlockedUserId == m.User.Id) &&
                                           !m.User.BlockList.Any(bl => bl.UserId == user.Id)).ToList();
        }

        return new GetLobbyMessagesForUserResponse { Messages = { messages } };
    }

    public override async Task<GetUserByUsernameResponse> GetUserByUsername(GetUserByUsernameRequest request, ServerCallContext context)
    {
        var ret = new GetUserByUsernameResponse();

        var user = await dbContext.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
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
            Registered = Timestamp.FromDateTime(user.RegisteredDateTime),
            Role = GetRoleForUser(user)
        };

        ret.User.BlockList.AddRange(user.BlockListEntries.Select(bl => new BlockListEntry
        {
            UserId = bl.BlockedUserId,
            Username = bl.BlockedUser?.UserName
        }));

        var settings = JsonSerializer.Deserialize<Data.Models.ThronetekiUserSettings>(user.Settings);

        ret.User.Settings = mapper.Map<ThronetekiUserSettings>(settings);

        return ret;
    }

    public override async Task<GetAllPacksResponse> GetAllPacks(GetAllPacksRequest request, ServerCallContext context)
    {
        var ret = new GetAllPacksResponse();

        var packs = mapper.Map<IEnumerable<LobbyPack>>(await dbContext.Packs.ToListAsync());

        ret.Packs.AddRange(packs);

        return ret;
    }

    private static LobbyMessage MapMessage(DbLobbyMessage message)
    {
        return new LobbyMessage
        {
            Id = message.Id,
            Message = message.Message,
            Time = message.PostedDateTime.ToTimestamp(),
            User = new ThronetekiUser
            {
                Avatar = (message.Poster.ProfileImage != null ? $"data:image/png;base64,{Convert.ToBase64String(message.Poster.ProfileImage.Image)}" : null) ?? string.Empty,
                Id = message.Poster.Id,
                Username = message.Poster.UserName,
                Registered = Timestamp.FromDateTime(message.Poster.RegisteredDateTime),
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