using Grpc.Core;
using Grpc.Net.Client;
using IdentityModel.Client;
using Throneteki.WebService;

namespace Throneteki.Lobby;

public class LobbyServiceFactory
{
    private readonly HttpClient httpClient;
    private readonly IConfiguration configuration;
    private LobbyService.LobbyServiceClient? lobbyServiceClient;

    public LobbyServiceFactory(HttpClient httpClient, IConfiguration configuration)
    {
        httpClient.BaseAddress = new Uri(configuration.GetSection("Settings")["AuthServerUrl"]);

        this.httpClient = httpClient;
        this.configuration = configuration;
    }

    public Task<LobbyService.LobbyServiceClient> GetUserServiceClient()
    {
        var address = configuration.GetSection("Settings")["UserServiceUrl"];

        if (lobbyServiceClient != null)
        {
            return Task.FromResult(lobbyServiceClient);
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

        return Task.FromResult(lobbyServiceClient);
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