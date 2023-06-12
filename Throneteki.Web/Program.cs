using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Throneteki.Data;
using Throneteki.Data.Models;
using Throneteki.Grpc.MappingProfiles;
using Throneteki.Models.Mapping;
using Throneteki.Models.Services;
using Throneteki.Web;
using Throneteki.Web.Mapping;
using Throneteki.Web.Models.Options;
using Throneteki.Web.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllersWithViews().AddRazorRuntimeCompilation();

var authServerUrl = builder.Configuration.GetSection("Settings")["AuthServerUrl"];

builder.Services.AddDbContext<ThronetekiDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
        .UseSnakeCaseNamingConvention();
});

var thronesDbOptions = new ThronesDbOptions();
builder.Configuration.GetSection("ThronesDb").Bind(thronesDbOptions);
builder.Services.Configure<ThronesDbOptions>(builder.Configuration.GetSection("ThronesDb"));


var authServices = builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme);

if (!string.IsNullOrEmpty(thronesDbOptions.ClientId))
{
    authServices.AddOAuth("ThronesDB", options =>
    {
        options.ClientId = thronesDbOptions.ClientId ?? string.Empty;
        options.ClientSecret = thronesDbOptions.ClientSecret ?? string.Empty;
        options.CallbackPath = "/signin-thronesdb";
        options.AuthorizationEndpoint = "https://thronesdb.com/oauth/v2/auth";
        options.TokenEndpoint = "https://thronesdb.com/oauth/v2/token";
        options.Scope.Add("read_deck");
        options.Events.OnCreatingTicket = async ctx =>
        {
            var dbContext = ctx.HttpContext.RequestServices.GetRequiredService<ThronetekiDbContext>();
            var userManager = ctx.HttpContext.RequestServices.GetRequiredService<UserManager<ThronetekiUser>>();

            var user = await userManager.FindByNameAsync(ctx.Properties.Items["UserId"]);
            user = await userManager.Users.Include(u => u.ExternalTokens).SingleOrDefaultAsync(u => u.Id == user.Id);
            if (user == null)
            {
                ctx.Fail("No user logged in");

                return;
            }

            var tdbToken = user.ExternalTokens.FirstOrDefault(et => et.ExternalId == "ThronesDB");
            if (tdbToken == null)
            {
                tdbToken = new ExternalToken();
                user.ExternalTokens.Add(tdbToken);
            }

            tdbToken.AccessToken = ctx.AccessToken ?? string.Empty;
            tdbToken.RefreshToken = ctx.RefreshToken ?? string.Empty;
            tdbToken.Expiry = DateTime.UtcNow.AddSeconds(ctx.ExpiresIn.GetValueOrDefault(TimeSpan.Zero).TotalSeconds);
            tdbToken.ExternalId = "ThronesDB";
            tdbToken.UserId = user.Id;

            await dbContext.SaveChangesAsync();
        };
    });
}

builder.Services.AddIdentity<ThronetekiUser, ThronetekiRole>()
    .AddEntityFrameworkStores<ThronetekiDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddOpenIddict()
    .AddValidation(options =>
    {
        options.SetIssuer(authServerUrl);
        options.AddAudiences("throneteki");

        options.AddEncryptionKey(new SymmetricSecurityKey(
            Convert.FromBase64String("DRjd/GnduI3Efzen9V9BvbNUfc/VKgXltV7Kbk9sMkY=")));

        options.UseSystemNetHttp();
        options.UseAspNetCore();
    });

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

builder.Services.AddHostedService<DataInitialisationWorker>();

builder.Services.AddAutoMapper(typeof(GrpcMappingProfile).Assembly, typeof(LobbyMappingProfile).Assembly, typeof(ApiMappingProfile).Assembly);

builder.Services.AddTransient<CardService>();
builder.Services.AddTransient<DeckService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseForwardedHeaders();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapDefaultControllerRoute();
});

app.MapFallbackToFile("index.html");

app.Run();
