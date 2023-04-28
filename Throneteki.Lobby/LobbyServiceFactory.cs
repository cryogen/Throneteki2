using Grpc.Core;
using Grpc.Net.Client;
using IdentityModel.Client;
using Microsoft.Extensions.Options;
using Throneteki.Lobby.Models;
using Throneteki.WebService;

namespace Throneteki.Lobby;

public class LobbyServiceFactory
{
    private readonly HttpClient httpClient;
    private readonly LobbyOptions lobbyOptions;
    private LobbyService.LobbyServiceClient? lobbyServiceClient;

    public LobbyServiceFactory(HttpClient httpClient, IOptions<LobbyOptions> lobbyOptions)
    {
        this.httpClient = httpClient;
        this.lobbyOptions = lobbyOptions.Value;

        httpClient.BaseAddress = new Uri(this.lobbyOptions.AuthServerUrl);
    }

    public LobbyService.LobbyServiceClient GetLobbyServiceClient()
    {
        var address = lobbyOptions.LobbyServiceUrl;

        if (lobbyServiceClient != null)
        {
            return lobbyServiceClient;
        }

        var credentials = CallCredentials.FromInterceptor(async (_, metadata) =>
        {
            var accessToken = await GetAccessToken();

            if (!string.IsNullOrEmpty(accessToken))
            {
                metadata.Add("Authorization", $"Bearer {accessToken}");
            }
        });

        var channel = GrpcChannel.ForAddress(address, new GrpcChannelOptions
        {
            Credentials = ChannelCredentials.Create(new SslCredentials(), credentials)
        });

        lobbyServiceClient = new LobbyService.LobbyServiceClient(channel);

        return lobbyServiceClient;
    }

    private async Task<string> GetAccessToken()
    {
        var discoveryDocument = await httpClient.GetDiscoveryDocumentAsync(new DiscoveryDocumentRequest
        {
            Policy =
            {
                RequireHttps = false
            }
        });

        if (discoveryDocument.IsError)
        {
            throw new ApplicationException($"Status code: {discoveryDocument.IsError}, Error: {discoveryDocument.Error}");
        }

        var tokenResponse = await httpClient.RequestClientCredentialsTokenAsync(new ClientCredentialsTokenRequest
        {
            Scope = "webservices",
            ClientSecret = "27EB193C-DDA7-4BE4-9A6B-81A4A04FA2AF",
            Address = discoveryDocument.TokenEndpoint,
            ClientId = "throneteki-webservices"
        });

        if (tokenResponse.IsError)
        {
            throw new ApplicationException($"Status code: {tokenResponse.IsError}, Error: {tokenResponse.Error}");
        }

        return tokenResponse.AccessToken;
    }
}