#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app

COPY ["Throneteki.Auth/thronetekiauth.pfx", "."]
COPY throneteki.crt /usr/local/share/ca-certificates/throneteki.crt
RUN chmod 644 /usr/local/share/ca-certificates/throneteki.crt && update-ca-certificates

EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["Throneteki.Auth/Throneteki.Auth.csproj", "Throneteki.Auth/"]
COPY ["Throneteki.Data/Throneteki.Data.csproj", "Throneteki.Data/"]
RUN dotnet restore "Throneteki.Auth/Throneteki.Auth.csproj"
COPY . .
WORKDIR "/src/Throneteki.Auth"
RUN dotnet build "Throneteki.Auth.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Throneteki.Auth.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "Throneteki.Auth.dll"]