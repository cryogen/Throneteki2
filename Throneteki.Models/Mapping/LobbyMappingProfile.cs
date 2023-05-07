using AutoMapper;
using Throneteki.Data.Models;
using Throneteki.Models.Models;

namespace Throneteki.Models.Mapping;

public class LobbyMappingProfile : Profile
{
    public LobbyMappingProfile()
    {
        CreateMap<Card, LobbyCard>()
            .ForMember(c => c.PackCode, cfg => cfg.MapFrom(s => s.Pack.Code))
            .ForMember(c => c.Faction, cfg => cfg.MapFrom(s => s.Faction.Code));

        CreateMap<Pack, LobbyPack>();

        CreateMap<Deck, LobbyDeck>();
    }
}