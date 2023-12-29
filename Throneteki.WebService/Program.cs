using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Validation.AspNetCore;
using Throneteki.Data;
using Throneteki.Grpc.MappingProfiles;
using Throneteki.Models.Mapping;
using Throneteki.WebService.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

var authServerUrl = builder.Configuration.GetSection("Settings")["AuthServerUrl"];

builder.Services.AddControllers();

builder.Services.AddDbContext<ThronetekiDbContext>(options => { options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")).UseSnakeCaseNamingConvention(); });

builder.Services.AddOpenIddict()
    .AddValidation(options =>
    {
        options.SetIssuer(authServerUrl ?? string.Empty);
        options.AddAudiences("throneteki-webservices");

        options.AddEncryptionKey(new SymmetricSecurityKey(
            Convert.FromBase64String("DRjd/GnduI3Efzen9V9BvbNUfc/VKgXltV7Kbk9sMkY=")));

        options.UseSystemNetHttp();
        options.UseAspNetCore();
    });

builder.Services.AddGrpc();

builder.Services.AddAutoMapper(typeof(GrpcMappingProfile).Assembly, typeof(LobbyMappingProfile).Assembly);

builder.Services.AddAuthentication(OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme);

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapGrpcService<ThronetekiServiceImpl>();

app.Run();