using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Throneteki.Data;
using Throneteki.Web.Models.News;

namespace Throneteki.Web.Services;

public class NewsService
{
    private readonly ThronetekiDbContext _context;
    private readonly IMapper _mapper;

    public NewsService(ThronetekiDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public Task<List<ApiNewsEntry>> GetNewsSummary()
    {
        var news = _context.News.OrderByDescending(n => n.PostedAt).Take(3);

        return _mapper.ProjectTo<ApiNewsEntry>(news).ToListAsync();
    }

    public async Task DeleteNews(IEnumerable<int> newsIds)
    {
        var newsToDelete = _context.News.Where(n => newsIds.Contains(n.Id));

        _context.News.RemoveRange(newsToDelete);

        await _context.SaveChangesAsync();
    }
}