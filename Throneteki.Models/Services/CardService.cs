using System.Text.Json;
using System.Text.Json.Serialization;
using Throneteki.Lobby.Models;
using Throneteki.Models.Models;

namespace Throneteki.Models.Services;

public class CardService
{
    public async Task<IReadOnlyCollection<LobbyRestrictedList>> GetRestrictedLists()
    {
        using var reader = File.OpenText("../throneteki-json-data/restricted-list.json");
        var listsString = await reader.ReadToEndAsync();

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

        options.Converters.Add(new JsonStringEnumConverter());

        var lists = JsonSerializer.Deserialize<IEnumerable<RestrictedList>>(listsString, options);
        var cardSets = lists.Select(rl => rl.CardSet).Distinct();

        return cardSets.Select(set =>
        {
            var activeVersion = GetActiveVersion(lists, set);
            var joustFormat = activeVersion.Formats.FirstOrDefault(f => f.Name == GameFormat.Joust);

            return new LobbyRestrictedList
            {
                Id = activeVersion.Code,
                Name = activeVersion.Name,
                Date = activeVersion.Date,
                Issuer = activeVersion.Issuer,
                CardSet = activeVersion.CardSet,
                Version = activeVersion.Version,
                Restricted = joustFormat.Restricted,
                Banned = activeVersion.BannedCards.Concat(joustFormat.Banned).ToList(),
                Pods = joustFormat.Pods,
                Official = true
            };
        }).ToList();
    }

    private RestrictedList GetActiveVersion(IEnumerable<RestrictedList> versions, RestrictedListCardSet cardSet)
    {
        var versionsForCardSet = versions.Where(version => version.CardSet == cardSet);

        return versionsForCardSet.OrderByDescending(v => v.Date).First();
    }
}