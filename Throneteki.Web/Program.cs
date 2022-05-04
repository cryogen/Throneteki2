using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OpenIddict.Abstractions;
using Quartz;
using Throneteki.Data;
using Throneteki.Data.Models;
using Throneteki.Web;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllersWithViews().AddRazorRuntimeCompilation();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme);

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

        options.AllowAuthorizationCodeFlow().RequireProofKeyForCodeExchange();

        options.AddEphemeralEncryptionKey().AddEphemeralSigningKey();
        options.RegisterScopes(OpenIddictConstants.Scopes.Email, OpenIddictConstants.Scopes.Profile, OpenIddictConstants.Scopes.Roles, "api");

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

builder.Services.AddHostedService<Worker>();

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
