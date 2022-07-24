using System.Runtime.CompilerServices;
using Grpc.Core;
using Grpc.Net.Client;
using IdentityModel.Client;
using Throneteki.WebService;

namespace Throneteki.Lobby;

public class UserServiceFactory
{
    private readonly HttpClient httpClient;
    private UserService.UserServiceClient? userServiceClient;

    public UserServiceFactory(HttpClient httpClient)
    {
        httpClient.BaseAddress = new Uri("https://localhost:44460");

        this.httpClient = httpClient;
    }

    public async Task<UserService.UserServiceClient?> GetUserServiceClient()
    {
        var address = "https://localhost:7125/UserService";

        if (userServiceClient != null)
        {
            return userServiceClient;
        }

        var accessToken = await GetAccessToken();

        var credentials = CallCredentials.FromInterceptor((_, metadata) =>
        {
            if (!string.IsNullOrEmpty(accessToken))
            {
                metadata.Add("Authorization", $"Bearer {accessToken}");
            }
            return Task.CompletedTask;
        });

        var channel = GrpcChannel.ForAddress(address, new GrpcChannelOptions
        {
            Credentials = ChannelCredentials.Create(new SslCredentials(), credentials)
        });

        userServiceClient = new UserService.UserServiceClient(channel);

        return userServiceClient;
    }

    private async Task<string> GetAccessToken()
    {
        var discoveryDocument = await httpClient.GetDiscoveryDocumentAsync();

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