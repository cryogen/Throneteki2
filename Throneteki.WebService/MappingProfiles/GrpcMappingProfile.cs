using AutoMapper;
using Google.Protobuf.WellKnownTypes;
using Throneteki.Data.Models;

namespace Throneteki.WebService.MappingProfiles;

public class GrpcMappingProfile : Profile
{
    public GrpcMappingProfile()
    {
        CreateMap<Deck, LobbyDeck>();
        CreateMap<Card, LobbyCard>()
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

        CreateMap<DeckCard, LobbyDeckCard>();
        CreateMap<Faction, LobbyFaction>();
        CreateMap<Data.Models.ThronetekiUserSettings, ThronetekiUserSettings>()
            .ForMember(s => s.CustomBackgroundUrl, cfg => cfg.MapFrom(s => s.CustomBackgroundUrl ?? string.Empty));

        CreateMap<DeckValidation.DeckValidationStatus, DeckValidationStatus>()
            .ForMember(s => s.FaqVersion, cfg => cfg.MapFrom(s => s.FaqVersion ?? string.Empty));

        CreateMap<Pack, LobbyPack>()
            .ForMember(p => p.ReleaseDate,
            cfg => cfg.MapFrom(s =>
                s.ReleaseDate.HasValue ? Timestamp.FromDateTime(s.ReleaseDate.Value) : new Timestamp()));
        CreateMap<LobbyPack, Models.Models.LobbyPack>()
            .ForMember(p => p.ReleaseDate,
                cfg => cfg.MapFrom(s =>
                    s.ReleaseDate.Nanos == 0 && s.ReleaseDate.Seconds == 0
                        ? (DateTime?)null
                        : s.ReleaseDate.ToDateTime()));
    }
}