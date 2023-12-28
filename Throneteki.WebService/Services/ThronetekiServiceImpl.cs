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
public class ThronetekiServiceImpl : ThronetekiService.ThronetekiServiceBase
{
    private readonly ThronetekiDbContext _dbContext;
    private readonly IMapper _mapper;

    public ThronetekiServiceImpl(ThronetekiDbContext dbContext, IMapper mapper)
    {
        _dbContext = dbContext;
        _mapper = mapper;
    }

    public override async Task<AddLobbyMessageResponse> AddLobbyMessage(AddLobbyMessageRequest request, ServerCallContext context)
    {
        var poster = await _dbContext.Users
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

        _dbContext.LobbyMessages.Add(newMessage);

        await _dbContext.SaveChangesAsync();

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
        var deck = await _dbContext.Decks
            .Include(d => d.Faction)
            .Include(d => d.Agenda)
            .ThenInclude(a => a != null ? a.Faction : null)
            .Include(d => d.Agenda)
            .ThenInclude(a => a != null ? a.Pack : null)
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

        var retDeck = _mapper.Map<Deck>(deck);
        retDeck.DrawCards.AddRange(_mapper.Map<IEnumerable<DeckCard>>(deck.DeckCards.Where(dc => dc.CardType == DeckCardType.Draw)));
        retDeck.PlotCards.AddRange(_mapper.Map<IEnumerable<DeckCard>>(deck.DeckCards.Where(dc => dc.CardType == DeckCardType.Plot)));
        if (deck.Agenda != null)
        {
            retDeck.Agendas.Add(_mapper.Map<Card>(deck.Agenda));
        }

        retDeck.Agendas.AddRange(_mapper.Map<IEnumerable<Card>>(deck.DeckCards.Where(dc => dc.CardType == DeckCardType.Banner).Select(dc => dc.Card)));

        return new GetDeckByIdResponse
        {
            Deck = retDeck
        };
    }

    [SuppressMessage("ReSharper", "SimplifyLinqExpressionUseAll")]
    public override async Task<GetLobbyMessagesForUserResponse> GetLobbyMessagesForUser(GetLobbyMessagesForUserRequest request, ServerCallContext context)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(user => user.Id == request.UserId);

        var messages = await _dbContext.LobbyMessages
            .Include(m => m.Poster)
            .ThenInclude(p => p.ProfileImage)
            .Include(m => m.Poster)
            .ThenInclude(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .Include(m => m.DeletedBy)
            .OrderByDescending(m => m.PostedDateTime)
            .Take(50)
            .Select(message => MapMessage(message)).ToListAsync();

        var roles = new List<string>();

        if (user != null)
        {
            messages = messages.Where(m => !user.BlockListEntries.Any(bl => bl.BlockedUserId == m.User.Id) &&
                                           !m.User.BlockList.Any(bl => bl.UserId == user.Id)).ToList();

            roles.AddRange(user.UserRoles.Select(ur => ur.Role.Name ?? $"Role: {ur.Role.Id}"));
        }

        if (user == null || !roles.Contains(Roles.ChatManager))
        {
            messages = messages.Where(m => !m.Deleted).ToList();
        }

        return new GetLobbyMessagesForUserResponse { Messages = { messages } };
    }

    public override async Task<GetUserByUsernameResponse> GetUserByUsername(GetUserByUsernameRequest request, ServerCallContext context)
    {
        var ret = new GetUserByUsernameResponse();

        var user = await _dbContext.Users
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

        ret.User.Permissions.AddRange(user.UserRoles.Select(ur => ur.Role.Name));

        ret.User.BlockList.AddRange(user.BlockListEntries.Select(bl => new BlockListEntry
        {
            UserId = bl.BlockedUserId,
            Username = bl.BlockedUser?.UserName
        }));

        var settings = JsonSerializer.Deserialize<Data.Models.ThronetekiUserSettings>(user.Settings ?? "{}",
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        ret.User.Settings = _mapper.Map<ThronetekiUserSettings>(settings);

        return ret;
    }

    public override async Task<GetAllPacksResponse> GetAllPacks(GetAllPacksRequest request, ServerCallContext context)
    {
        var ret = new GetAllPacksResponse();

        var packs = _mapper.Map<IEnumerable<Pack>>(await _dbContext.Packs.ToListAsync());

        ret.Packs.AddRange(packs);

        return ret;
    }

    public override async Task<CreateGameResponse> CreateGame(CreateGameRequest request, ServerCallContext context)
    {
        var dbGame = _mapper.Map<Game>(request.Game);

        if (request.Game.Winner != string.Empty)
        {
            dbGame.Winner = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserName == request.Game.Winner);
        }

        dbGame.Players = new List<GamePlayer>();

        foreach (var player in request.Game.Players)
        {
            var dbPlayer = new GamePlayer
            {
                DeckId = player.DeckId,
                Player = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserName == player.Player) ?? throw new InvalidOperationException()
            };

            dbGame.Players.Add(dbPlayer);
        }

        if (dbGame.WinReason == string.Empty)
        {
            dbGame.WinReason = null;
        }

        _dbContext.Games.Add(dbGame);

        await _dbContext.SaveChangesAsync();

        return new CreateGameResponse();
    }

    public override async Task<UpdateGameResponse> UpdateGame(UpdateGameRequest request, ServerCallContext context)
    {
        var game = await _dbContext.Games
            .Include(g => g.Players)
            .FirstOrDefaultAsync(g => g.GameId.ToString() == request.Game.GameId);

        if (game == null)
        {
            return new UpdateGameResponse();
        }

        if (request.Game.Winner != string.Empty)
        {
            game.Winner = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserName == request.Game.Winner);
        }

        foreach (var player in request.Game.Players)
        {
            var dbPlayer = game.Players.First(p => p.Player.UserName == player.Player);

            dbPlayer.DeckId = player.DeckId;
            dbPlayer.TotalPower = player.TotalPower;
        }

        game.WinReason = game.WinReason == string.Empty ? null : request.Game.WinReason;
        game.FinishedAt = request.Game.FinishedAt.Nanos == 0 && request.Game.FinishedAt.Seconds == 0
            ? null
            : request.Game.FinishedAt.ToDateTime();

        await _dbContext.SaveChangesAsync();

        return new UpdateGameResponse();
    }

    public override async Task<RemoveLobbyMessageResponse> RemoveLobbyMessage(RemoveLobbyMessageRequest request, ServerCallContext context)
    {
        var lobbyMessage = await _dbContext.LobbyMessages.FirstOrDefaultAsync(lm => lm.Id == request.MessageId);

        if (lobbyMessage == null)
        {
            return new RemoveLobbyMessageResponse();
        }

        lobbyMessage.Deleted = true;
        lobbyMessage.DeletedById = request.DeletedByUserId;

        await _dbContext.SaveChangesAsync();

        return new RemoveLobbyMessageResponse();
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
            },
            Deleted = message.Deleted,
            Deletedby = message.DeletedBy?.UserName ?? string.Empty
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