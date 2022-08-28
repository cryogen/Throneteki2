using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Validation.AspNetCore;
using Throneteki.Data;
using Throneteki.WebService.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

var authServerUrl = builder.Configuration.GetSection("Settings")["AuthServerUrl"];

builder.Services.AddControllers();

builder.Services.AddDbContext<ThronetekiDbContext>(options => { options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")).UseSnakeCaseNamingConvention(); });

builder.Services.AddOpenIddict()
    .AddValidation(options =>
    {
        options.SetIssuer(authServerUrl);
        options.AddAudiences("throneteki-webservices");

        options.AddEncryptionKey(new SymmetricSecurityKey(
            Convert.FromBase64String("DRjd/GnduI3Efzen9V9BvbNUfc/VKgXltV7Kbk9sMkY=")));

        options.UseSystemNetHttp();
        options.UseAspNetCore();
    });

builder.Services.AddGrpc();

builder.Services.AddAuthentication(OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme);

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseEndpoints(endpoints => { endpoints.MapGrpcService<ThronetekiServiceImpl>(); });

app.Run();