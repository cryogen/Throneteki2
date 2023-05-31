using AutoMapper;
using Google.Protobuf.WellKnownTypes;
using Throneteki.Models.Models;
using Throneteki.WebService;

namespace Throneteki.Grpc.MappingProfiles;

public class GrpcMappingProfile : Profile
{
    public GrpcMappingProfile()
    {
        CreateMap<Data.Models.Deck, Deck>();
        CreateMap<Data.Models.Card, Card>()
            .ForMember(c => c.Faction, cfg => cfg.MapFrom(s => s.Faction.Code))
            .ForMember(c => c.PackCode, cfg => cfg.MapFrom(s => s.Pack.Code))
            .ForMember(c => c.Icons, cfg => cfg.MapFrom(s => s.Icons ?? string.Empty))
            .ForMember(c => c.Traits, cfg => cfg.Ignore())
            .AfterMap((card, lobbyCard) =>
            {
                if (card.Traits != null)
                {
                    lobbyCard.Traits.AddRange(card.Traits.Split('.',
                        StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
                }
            });

        CreateMap<Data.Models.DeckCard, DeckCard>();
        CreateMap<Data.Models.Faction, Faction>();
        CreateMap<Data.Models.ThronetekiUserSettings, ThronetekiUserSettings>()
            .ForMember(s => s.CustomBackgroundUrl, cfg => cfg.MapFrom(s => s.CustomBackgroundUrl ?? string.Empty))
            .ForMember(s => s.KeywordSettings, cfg => cfg.MapFrom(s => new KeywordSettings
            {
                ChooseCards = s.ChooseCards,
                ChooseOrder = s.ChooseOrder
            }));

        CreateMap<Data.Models.Pack, Pack>()
            .ForMember(p => p.ReleaseDate,
            cfg => cfg.MapFrom(s =>
                s.ReleaseDate.HasValue ? Timestamp.FromDateTime(s.ReleaseDate.Value) : new Timestamp()));
        CreateMap<Pack, LobbyPack>()
            .ForMember(p => p.ReleaseDate,
                cfg => cfg.MapFrom(s =>
                    s.ReleaseDate.Nanos == 0 && s.ReleaseDate.Seconds == 0
                        ? (DateTime?)null
                        : s.ReleaseDate.ToDateTime()));

        CreateMap<Deck, LobbyDeck>();
        CreateMap<Faction, LobbyFaction>();
        CreateMap<DeckCard, LobbyDeckCard>();
        CreateMap<Card, LobbyCard>();
    }
}