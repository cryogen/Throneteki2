using Microsoft.EntityFrameworkCore;
using OpenIddict.Validation.AspNetCore;
using Throneteki.Data;
using Throneteki.WebService.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddDbContext<ThronetekiDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddOpenIddict()
    .AddValidation(options =>
    {
        options.SetIssuer("https://localhost:44460/");
        options.AddAudiences("throneteki-webservices");

        options.UseIntrospection()
            .SetClientId("throneteki-webservices")
            .SetClientSecret("27EB193C-DDA7-4BE4-9A6B-81A4A04FA2AF");

        options.UseSystemNetHttp();
        options.UseAspNetCore();
    });

builder.Services.AddGrpc();

builder.Services.AddAuthentication(OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme);

var app = builder.Build();

app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.MapGrpcService<UserServiceImpl>();
});

app.Run();
