using AutoMapper;
using Google.Protobuf.WellKnownTypes;
using Throneteki.Data.Models;
using Throneteki.Models.Models;
using Throneteki.WebService;
using Card = Throneteki.WebService.Card;
using Deck = Throneteki.WebService.Deck;
using DeckCard = Throneteki.WebService.DeckCard;
using Faction = Throneteki.WebService.Faction;
using Pack = Throneteki.WebService.Pack;
using ThronetekiUser = Throneteki.WebService.ThronetekiUser;
using ThronetekiUserSettings = Throneteki.WebService.ThronetekiUserSettings;

namespace Throneteki.Grpc.MappingProfiles;

public class GrpcMappingProfile : Profile
{
    public GrpcMappingProfile()
    {
        CreateMap<Data.Models.Deck, Deck>();
        CreateMap<Data.Models.Card, Card>()
            .ForMember(c => c.PackCode, cfg => cfg.MapFrom(s => s.Pack.Code))
            .ForMember(c => c.Icons, cfg => cfg.MapFrom(s => s.Icons ?? string.Empty))
            .ForMember(c => c.Traits, cfg => cfg.Ignore())
            .AfterMap((card, lobbyCard) =>
            {
                if (card.Traits != null)
                {
                    lobbyCard.Traits.AddRange(card.Traits.Split(',',
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
        CreateMap<Card, LobbyCard>()
            .ForMember(c => c.Faction, cfg => cfg.MapFrom(s => s.Faction.Code));

        CreateMap<ThronetekiGame, Game>()
            .ForMember(g => g.StartedAt, cfg => cfg.MapFrom(s => s.StartedAt.ToDateTime()))
            .ForMember(g => g.FinishedAt,
                cfg => cfg.MapFrom(s =>
                    s.FinishedAt.Nanos == 0 && s.FinishedAt.Seconds == 0
                        ? null
                        : (DateTime?)s.FinishedAt.ToDateTime()))
            .ForMember(g => g.WinnerId, cfg => cfg.Ignore())
            .ForMember(g => g.Winner, cfg => cfg.Ignore());

        CreateMap<ThronetekiGamePlayer, GamePlayer>()
            .ForMember(p => p.Player, cfg => cfg.Ignore())
            .ForMember(p => p.PlayerId, cfg => cfg.Ignore());

        CreateMap<LobbyCard, Card>();
        CreateMap<LobbyFaction, Faction>();

        CreateMap<ThronetekiUser, Data.Models.ThronetekiUser>();
        CreateMap<Faction, Data.Models.Faction>();
        CreateMap<Card, Data.Models.Card>();
    }
}