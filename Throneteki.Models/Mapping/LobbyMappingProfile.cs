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
            .ForMember(c => c.Faction, cfg => cfg.MapFrom(s => s.Faction.Code))
            .ForMember(c => c.Traits,
                cfg => cfg.MapFrom(s =>
                    (s.Traits ?? string.Empty).Split(',',
                        StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)));

        CreateMap<DeckCard, LobbyDeckCard>();

        CreateMap<Pack, LobbyPack>();

        CreateMap<Deck, LobbyDeck>()
            .ForMember(d => d.Agendas,
                cfg => cfg.MapFrom(s =>
                    s.DeckCards.Where(dc => dc.CardType == DeckCardType.Banner).Select(dc => dc.Card).Concat(
                        s.Agenda != null
                            ? new[] { s.Agenda }
                            : Array.Empty<Card>())))
            .ForMember(d => d.PlotCards,
                cfg => cfg.MapFrom(s => s.DeckCards.Where(dc => dc.CardType == DeckCardType.Plot)))
            .ForMember(d => d.DrawCards,
                cfg => cfg.MapFrom(s => s.DeckCards.Where(dc => dc.CardType == DeckCardType.Draw)))
            .ForMember(d => d.Owner, cfg => cfg.MapFrom(s => s.User.UserName));
     
        CreateMap<Faction, LobbyFaction>();
    }
}