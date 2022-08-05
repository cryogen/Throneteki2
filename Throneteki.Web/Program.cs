using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Abstractions;
using Quartz;
using Throneteki.Data;
using Throneteki.Data.Models;
using Throneteki.Web;
using Throneteki.Web.Helpers;
using Throneteki.Web.Models.Options;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllersWithViews().AddRazorRuntimeCompilation();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddHttpClient();
builder.Services.AddTransient<IClaimsTransformation, ThronetekiUserClaimsTransformation>();

builder.Services.AddDbContext<ThronetekiDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
    options.UseOpenIddict();
});

// Register the Identity services.
builder.Services.AddIdentity<ThronetekiUser, IdentityRole>()
    .AddEntityFrameworkStores<ThronetekiDbContext>()
    .AddDefaultTokenProviders();

builder.Services.Configure<IdentityOptions>(options =>
{
    options.ClaimsIdentity.UserNameClaimType = OpenIddictConstants.Claims.Name;
    options.ClaimsIdentity.UserIdClaimType = OpenIddictConstants.Claims.Subject;
    options.ClaimsIdentity.RoleClaimType = OpenIddictConstants.Claims.Role;
});

builder.Services.AddQuartz(options =>
{
    options.UseMicrosoftDependencyInjectionJobFactory();
    options.UseSimpleTypeLoader();
    options.UseInMemoryStore();
});

builder.Services.AddQuartzHostedService(options => options.WaitForJobsToComplete = true);

var thronesDbOptions = new ThronesDbOptions();
builder.Configuration.GetSection("ThronesDb").Bind(thronesDbOptions);

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddOAuth("ThronesDB", options =>
    {
        options.ClientId = thronesDbOptions.ClientId ?? string.Empty;
        options.ClientSecret = thronesDbOptions.ClientSecret ?? string.Empty;
        options.CallbackPath = "/signin-thronesdb";
        options.AuthorizationEndpoint = "https://thronesdb.com/oauth/v2/auth";
        options.TokenEndpoint = "https://thronesdb.com/oauth/v2/token";
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
            tdbToken.Expiry = DateTime.Now.AddSeconds(ctx.ExpiresIn.GetValueOrDefault(TimeSpan.Zero).TotalSeconds);
            tdbToken.ExternalId = "ThronesDB";
            tdbToken.UserId = user.Id;

            await dbContext.SaveChangesAsync();
        };
    });

builder.Services.AddOpenIddict()
    .AddCore(options =>
    {
        options.UseEntityFrameworkCore().UseDbContext<ThronetekiDbContext>();
    })
    .AddServer(options =>
    {
        options.SetTokenEndpointUris("/connect/token");
        options.SetAuthorizationEndpointUris("/connect/authorize");
        options.SetLogoutEndpointUris("/connect/logout");
        options.SetUserinfoEndpointUris("/connect/userinfo");
        options.SetIntrospectionEndpointUris("/introspect");

        options.AllowClientCredentialsFlow().AllowAuthorizationCodeFlow().RequireProofKeyForCodeExchange().AllowRefreshTokenFlow();

        options.AddEncryptionKey(new SymmetricSecurityKey(Convert.FromBase64String("DRjd/GnduI3Efzen9V9BvbNUfc/VKgXltV7Kbk9sMkY=")));

        options.AddDevelopmentEncryptionCertificate().AddDevelopmentSigningCertificate();
        options.RegisterScopes(OpenIddictConstants.Scopes.Email, OpenIddictConstants.Scopes.Profile, OpenIddictConstants.Scopes.Roles, "api", "lobby");

        options.UseAspNetCore()
            .EnableTokenEndpointPassthrough()
            .EnableAuthorizationEndpointPassthrough()
            .EnableUserinfoEndpointPassthrough()
            .EnableLogoutEndpointPassthrough();
    })
    .AddValidation(options =>
    {
        options.UseLocalServer();
        options.UseAspNetCore();
    });

builder.Services.AddHostedService<DataInitialisationWorker>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
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
