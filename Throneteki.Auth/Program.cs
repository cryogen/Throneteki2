using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Abstractions;
using Quartz;
using Throneteki.Auth;
using Throneteki.Auth.Helpers;
using Throneteki.Data;
using Throneteki.Data.Models;

var builder = WebApplication.CreateBuilder(args);

const string corsPolicy = "AllowLocal";

builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicy,
        policyBuilder => policyBuilder.WithOrigins("https://localhost:44460").SetIsOriginAllowedToAllowWildcardSubdomains().AllowAnyHeader().AllowAnyMethod().AllowCredentials());
});

// Add services to the container.
builder.Services.AddControllersWithViews().AddRazorRuntimeCompilation();
builder.Services.AddHttpClient();

builder.Services.AddTransient<IClaimsTransformation, ThronetekiUserClaimsTransformation>();

builder.Services.AddDbContext<ThronetekiDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
        .UseSnakeCaseNamingConvention();
    options.UseOpenIddict();
});

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

builder.Services.AddOpenIddict()
    .AddCore(options => { options.UseEntityFrameworkCore().UseDbContext<ThronetekiDbContext>(); })
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
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseCors(corsPolicy);

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


app.Run();
