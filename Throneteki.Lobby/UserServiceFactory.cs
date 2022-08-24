using Grpc.Core;
using Grpc.Net.Client;
using IdentityModel.Client;
using Throneteki.WebService;

namespace Throneteki.Lobby;

public class UserServiceFactory
{
    private readonly HttpClient httpClient;
    private readonly IConfiguration configuration;
    private UserService.UserServiceClient? userServiceClient;

    public UserServiceFactory(HttpClient httpClient, IConfiguration configuration)
    {
        httpClient.BaseAddress = new Uri(configuration.GetSection("Settings")["AuthServerUrl"]);

        this.httpClient = httpClient;
        this.configuration = configuration;
    }

    public Task<UserService.UserServiceClient> GetUserServiceClient()
    {
        var address = configuration.GetSection("Settings")["UserServiceUrl"];

        if (userServiceClient != null)
        {
            return Task.FromResult(userServiceClient);
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

        userServiceClient = new UserService.UserServiceClient(channel);

        return Task.FromResult(userServiceClient);
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