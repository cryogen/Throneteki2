using Grpc.Core;
using Grpc.Net.Client;
using IdentityModel.Client;
using Microsoft.Extensions.Options;
using Throneteki.Lobby.Models;
using Throneteki.WebService;

namespace Throneteki.Lobby;

public class ThronetekiServiceFactory
{
    private readonly HttpClient _httpClient;
    private readonly LobbyOptions _lobbyOptions;
    private ThronetekiService.ThronetekiServiceClient? _thronetekiServiceClient;

    public ThronetekiServiceFactory(HttpClient httpClient, IOptions<LobbyOptions> lobbyOptions)
    {
        _httpClient = httpClient;
        _lobbyOptions = lobbyOptions.Value;

        if (_lobbyOptions.AuthServerUrl == null)
        {
            throw new InvalidOperationException("Cannot have a lobby service connection with an auth server url");
        }

        httpClient.BaseAddress = new Uri(_lobbyOptions.AuthServerUrl);
    }

    public ThronetekiService.ThronetekiServiceClient GetLobbyServiceClient()
    {
        var address = _lobbyOptions.LobbyServiceUrl;

        if (address == null)
        {
            throw new InvalidOperationException("Auth server url is missing");
        }

        if (_thronetekiServiceClient != null)
        {
            return _thronetekiServiceClient;
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

        _thronetekiServiceClient = new ThronetekiService.ThronetekiServiceClient(channel);

        return _thronetekiServiceClient;
    }

    private async Task<string> GetAccessToken()
    {
        var discoveryDocument = await _httpClient.GetDiscoveryDocumentAsync(new DiscoveryDocumentRequest
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

        var tokenResponse = await _httpClient.RequestClientCredentialsTokenAsync(new ClientCredentialsTokenRequest
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