using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.HttpOverrides;
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

var settingsSection = builder.Configuration.GetSection("Settings");

builder.Services.AddCors(options =>
{
    if (string.IsNullOrEmpty(settingsSection["CorsOrigins"]))
    {
        return;
    }

    options.AddPolicy(corsPolicy,
        policyBuilder =>
            policyBuilder.WithOrigins(settingsSection["CorsOrigins"]!.Split(',', StringSplitOptions.RemoveEmptyEntries))
                .SetIsOriginAllowedToAllowWildcardSubdomains()
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials());
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

builder.Services.AddControllersWithViews().AddRazorRuntimeCompilation();
builder.Services.AddHttpClient();

builder.Services.AddTransient<IClaimsTransformation, ThronetekiUserClaimsTransformation>();

builder.Services.AddDbContext<ThronetekiDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
        .UseSnakeCaseNamingConvention();
    options.UseOpenIddict();
});

builder.Services.AddIdentity<ThronetekiUser, ThronetekiRole>()
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

        if (builder.Environment.IsDevelopment())
        {
            options.AddDevelopmentEncryptionCertificate().AddDevelopmentSigningCertificate();
        }
        else if(!string.IsNullOrEmpty(settingsSection["EncryptionCertificatePath"]) && !string.IsNullOrEmpty(settingsSection["SigningCertificatePath"]))
        {
            options.AddEncryptionCertificate(new X509Certificate2(settingsSection["EncryptionCertificatePath"]!))
                .AddSigningCertificate(new X509Certificate2(settingsSection["SigningCertificatePath"]!));
        }

        options.RegisterScopes(OpenIddictConstants.Scopes.Email, OpenIddictConstants.Scopes.Profile, OpenIddictConstants.Scopes.Roles, "api", "lobby");

        options.UseAspNetCore()
            .DisableTransportSecurityRequirement()
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
    app.UseForwardedHeaders();
    app.UseExceptionHandler("/Error");
}

app.UseCors(corsPolicy);

app.UseStaticFiles();

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapDefaultControllerRoute();

app.Run();
