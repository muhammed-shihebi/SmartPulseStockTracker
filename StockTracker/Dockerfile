#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443
RUN apt-get update && apt-get -qq -y install curl
RUN curl -sL https://deb.nodesource.com/setup_14.x |  bash -
RUN apt-get install -y nodejs

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
RUN apt-get update && apt-get -qq -y install curl
RUN curl -sL https://deb.nodesource.com/setup_14.x |  bash -
RUN apt-get install -y nodejs
WORKDIR /src
COPY ["StockTracker.csproj", "."]
RUN dotnet restore "./StockTracker.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "StockTracker.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "StockTracker.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "StockTracker.dll"]