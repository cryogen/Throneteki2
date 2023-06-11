using AutoMapper;
using Throneteki.Data.Models;
using Throneteki.Models.Models;
using Throneteki.Web.Models.Decks;

namespace Throneteki.Web.Mapping;

public class ApiMappingProfile : Profile
{
    public ApiMappingProfile()
    {
        CreateMap<Deck, ApiDeck>()
            .ForMember(d => d.Owner, cfg => cfg.MapFrom(s => s.User.UserName));
        CreateMap<Card, ApiCard>();
        CreateMap<Faction, ApiFaction>();
        CreateMap<DeckCard, ApiDeckCard>()
            .ForMember(d => d.Type, cfg => cfg.MapFrom(s => s.CardType.ToString()));

        CreateMap<ApiDeck, LobbyDeck>()
            .ForMember(d => d.Agendas,
                cfg => cfg.MapFrom(s =>
                    s.DeckCards.Where(dc => dc.Type == DeckCardType.Banner.ToString()).Select(dc => dc.Card).Concat(
                        s.Agenda != null
                            ? new[] { s.Agenda }
                            : Array.Empty<ApiCard>())))
            .ForMember(d => d.PlotCards,
                cfg => cfg.MapFrom(s => s.DeckCards.Where(dc => dc.Type == DeckCardType.Plot.ToString())))
            .ForMember(d => d.DrawCards,
                cfg => cfg.MapFrom(s => s.DeckCards.Where(dc => dc.Type == DeckCardType.Draw.ToString())))
            .ForMember(d => d.Owner, cfg => cfg.MapFrom(s => string.Empty));
        CreateMap<ApiFaction, LobbyFaction>();
        CreateMap<ApiDeckCard, LobbyDeckCard>();
        CreateMap<ApiCard, LobbyCard>();

        CreateMap<DeckWithStats, ApiDeck>()
            .ConstructUsing((deckWithStats, context) => context.Mapper.Map<ApiDeck>(deckWithStats.Deck));
    }
}