#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

COPY throneteki.crt /usr/local/share/ca-certificates/throneteki.crt
RUN chmod 644 /usr/local/share/ca-certificates/throneteki.crt && update-ca-certificates

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["Throneteki.Lobby/Throneteki.Lobby.csproj", "Throneteki.Lobby/"]
COPY ["Throneteki.WebService/Throneteki.WebService.csproj", "Throneteki.WebService/"]
COPY ["Throneteki.Data/Throneteki.Data.csproj", "Throneteki.Data/"]
RUN dotnet restore "Throneteki.Lobby/Throneteki.Lobby.csproj"
COPY . .
WORKDIR "/src/Throneteki.Lobby"
RUN dotnet build "Throneteki.Lobby.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Throneteki.Lobby.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Throneteki.Lobby.dll"]