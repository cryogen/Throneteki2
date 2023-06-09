using Microsoft.Extensions.Options;
using Throneteki.Lobby.Services;
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Validation.AspNetCore;
using StackExchange.Redis;
using Throneteki.DeckValidation;
using Throneteki.Grpc.MappingProfiles;
using Throneteki.Lobby;
using Throneteki.Lobby.Models;
using Throneteki.Lobby.Redis;
using Throneteki.Lobby.Redis.Commands.Incoming;
using Throneteki.Lobby.Redis.Handlers;
using Throneteki.Models.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSignalR();

var lobbySection = builder.Configuration.GetSection(LobbyOptions.OptionsName);
var lobbyOptions = new LobbyOptions();

lobbySection.Bind(lobbyOptions);

builder.Services.Configure<LobbyOptions>(lobbySection);

builder.Services.AddAutoMapper(typeof(GrpcMappingProfile).Assembly);
builder.Services.AddDeckValidation();

var authServerUrl = lobbyOptions.AuthServerUrl;

if (authServerUrl != null)
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("DontCare",
            policyBuilder => policyBuilder.WithOrigins(authServerUrl).AllowAnyHeader().AllowAnyMethod()
                .AllowCredentials());
    });
}

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
    new ThronetekiServiceFactory(provider.GetRequiredService<HttpClient>(),
        provider.GetRequiredService<IOptions<LobbyOptions>>()).GetLobbyServiceClient());
builder.Services.AddSingleton<LobbyService>();
builder.Services.AddSingleton<IConnectionMultiplexer>(provider =>
    ConnectionMultiplexer.Connect(lobbyOptions.RedisUrl ?? throw new InvalidOperationException()));
builder.Services.AddSingleton<RedisCommandHandlerFactory>();
builder.Services.AddSingleton<GameNodeManager>();
builder.Services.AddTransient<IRedisCommandHandler<RedisIncomingMessage<HelloMessage>>, HelloMessageHandler>();
builder.Services.AddTransient<IRedisCommandHandler<RedisIncomingMessage<GameWonMessage>>, GameWonMessageHandler>();
builder.Services.AddTransient<IRedisCommandHandler<RedisIncomingMessage<GameClosedMessage>>, GameClosedMessageHandler>();
builder.Services.AddTransient<CardService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseCors("DontCare");

app.MapHub<LobbyHub>("/lobbyhub");

var gameNodeManager = app.Services.GetRequiredService<GameNodeManager>();

await gameNodeManager.Initialise();

app.Run();