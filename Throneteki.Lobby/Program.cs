
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Validation.AspNetCore;
using Throneteki.Lobby;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSignalR();

var authServerUrl = builder.Configuration.GetSection("Settings")["AuthServerUrl"];

builder.Services.AddCors(options =>
    {
        options.AddPolicy("DontCare", policyBuilder => policyBuilder.WithOrigins(authServerUrl).AllowAnyHeader().AllowAnyMethod().AllowCredentials());
    });

builder.Services.AddOpenIddict()
    .AddValidation(options =>
    {
        options.SetIssuer(authServerUrl);
        options.AddAudiences("throneteki-lobby");

        options.AddEncryptionKey(new SymmetricSecurityKey(
            Convert.FromBase64String("DRjd/GnduI3Efzen9V9BvbNUfc/VKgXltV7Kbk9sMkY=")));

        options.UseSystemNetHttp();
        options.UseAspNetCore();
    });

builder.Services.AddAuthentication(OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme);

builder.Services.AddSingleton<UserServiceFactory>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseCors("DontCare");

app.MapHub<LobbyHub>("/lobbyhub");

app.Run();
