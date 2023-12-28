using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenIddict.Validation.AspNetCore;
using Throneteki.Data;
using Throneteki.Data.Models;
using Throneteki.Web.Models;
using Throneteki.Web.Models.Decks;
using Throneteki.Web.Models.News;
using Throneteki.Web.Models.User;
using Throneteki.Web.Services;

namespace Throneteki.Web.Controllers.Api;

[ApiController]
[Authorize(AuthenticationSchemes = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme)]
[Route("/api/admin/")]
public class AdminController : ControllerBase
{
    private readonly ThronetekiDbContext _dbContext;
    private readonly UserManager<ThronetekiUser> _userManager;
    private readonly NewsService _newsService;
    private readonly IMapper _mapper;

    public AdminController(ThronetekiDbContext dbContext, UserManager<ThronetekiUser> userManager, NewsService newsService, IMapper mapper)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _newsService = newsService;
        _mapper = mapper;
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
            user.Id,
            Username = user.UserName,
            user.Email,
            user.RegisteredDateTime,
            Permissions = (await _userManager.GetRolesAsync(user)).ToDictionary(k => k, v => true)
        });
    }

    [HttpGet("news")]
    [Authorize(Roles = Roles.NewsManager)]
    public async Task<IActionResult> GetNews()
    {
        var query = _dbContext.News.OrderByDescending(n => n.PostedBy);

        var response = new ApiPagedDataResponse<IEnumerable<ApiNewsEntry>>
        {
            Data = _mapper.ProjectTo<ApiNewsEntry>(query),
            Success = true,
            TotalCount = await query.CountAsync()
        };

        return Ok(response);
    }

    [HttpPost("news")]
    [Authorize(Roles = Roles.NewsManager)]
    public async Task<IActionResult> AddNewsEntry(AddNewsRequest request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByNameAsync(User.Identity?.Name ?? throw new InvalidOperationException("User name null"));

        var newNewsEntry = new NewsEntry
        {
            PostedAt = DateTime.UtcNow,
            PostedBy = user!,
            Text = request.Text
        };

        _dbContext.News.Add(newNewsEntry);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new ApiResponse { Success = true });
    }


    [HttpPatch("news/{newsId}")]
    [Authorize(Roles = Roles.NewsManager)]
    public async Task<IActionResult> SaveNewsEntry([FromRoute] int newsId, AddNewsRequest request, CancellationToken cancellationToken)
    {
        var newsEntry = _dbContext.News.FirstOrDefault(n => n.Id == newsId);

        if(newsEntry == null)
        {
            return NotFound();
        }

        newsEntry.Text = request.Text; 

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new ApiResponse { Success = true });
    }

    [HttpDelete]
    [Authorize(Roles = Roles.NewsManager)]
    public async Task<IActionResult> DeleteNews(DeleteNewsRequest request)
    {
        await _newsService.DeleteNews(request.NewsIds);

        return Ok(new ApiResponse
        {
            Success = true
        });
    }

    [HttpPatch("user/{userId}")]
    [Authorize(Roles = Roles.UserManager)]
    public async Task<IActionResult> SaveUser(string userId, AdminSaveUserRequest request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

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