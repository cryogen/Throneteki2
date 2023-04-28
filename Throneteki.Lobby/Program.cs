using Microsoft.Extensions.Options;
using Throneteki.Lobby.Services;
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Validation.AspNetCore;
using StackExchange.Redis;
using Throneteki.Lobby;
using Throneteki.Lobby.Models;
using Throneteki.Lobby.Redis;
using Throneteki.Lobby.Redis.Commands.Incoming;
using Throneteki.Lobby.Redis.Handlers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSignalR();

var lobbySection = builder.Configuration.GetSection(LobbyOptions.OptionsName);
var lobbyOptions = new LobbyOptions();

lobbySection.Bind(lobbyOptions);

builder.Services.Configure<LobbyOptions>(lobbySection);

var authServerUrl = lobbyOptions.AuthServerUrl;

builder.Services.AddCors(options =>
{
    options.AddPolicy("DontCare", policyBuilder => policyBuilder.WithOrigins(authServerUrl).AllowAnyHeader().AllowAnyMethod().AllowCredentials());
});

builder.Services.AddOpenIddict()
    .AddValidation(options =>
    {
        options.SetIssuer(lobbyOptions.AuthServerUrl ?? "Default");
        options.AddAudiences("throneteki-lobby");

        options.AddEncryptionKey(new SymmetricSecurityKey(
            Convert.FromBase64String("DRjd/GnduI3Efzen9V9BvbNUfc/VKgXltV7Kbk9sMkY=")));

        options.UseSystemNetHttp();
        options.UseAspNetCore();
    });

builder.Services.AddAuthentication(OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme);

builder.Services.AddSingleton(provider =>
    new LobbyServiceFactory(provider.GetRequiredService<HttpClient>(),
        provider.GetRequiredService<IOptions<LobbyOptions>>()).GetLobbyServiceClient());
builder.Services.AddSingleton<GameNodesService>();
builder.Services.AddSingleton<IConnectionMultiplexer>(provider =>
    ConnectionMultiplexer.Connect(lobbyOptions.RedisUrl ?? throw new InvalidOperationException()));
builder.Services.AddSingleton<RedisCommandHandlerFactory>();
builder.Services.AddSingleton<GameNodeManager>();
builder.Services.AddTransient<IRedisCommandHandler<RedisIncomingMessage<HelloMessage>>, HelloMessageHandler>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseCors("DontCare");

app.MapHub<LobbyHub>("/lobbyhub");

var gameNodesService = app.Services.GetRequiredService<GameNodesService>();

await gameNodesService.Initialise();

app.Run();