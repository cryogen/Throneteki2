using AutoMapper;
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
            .ForMember(c => c.Icons, cfg => cfg.MapFrom(s => s.Icons ?? string.Empty));
        CreateMap<Faction, LobbyFaction>();
        CreateMap<Data.Models.ThronetekiUserSettings, ThronetekiUserSettings>()
            .ForMember(s => s.CustomBackgroundUrl, cfg => cfg.MapFrom(s => s.CustomBackgroundUrl ?? string.Empty));

        CreateMap<DeckCard, LobbyDeckCard>();
    }
}