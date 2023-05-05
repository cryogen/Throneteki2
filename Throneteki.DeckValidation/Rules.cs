using System.Text.RegularExpressions;
using Grpc.Core;
using LobbyCard = Throneteki.WebService.LobbyCard;

namespace Throneteki.DeckValidation;

public static class Rules
{
    private static bool HasTrait(LobbyCard card, string trait)
    {
        return card.Traits.Any(t => string.Equals(t, trait, StringComparison.CurrentCultureIgnoreCase));
    }

    private static bool HasKeyword(LobbyCard card, string keywordRegex)
    {
        var lines = card.Text.Split('\n');
        var keywordLine = lines.Any() ? lines[0] : string.Empty;
        var keywords = keywordLine.Split('.').Select(keyword => keyword.Trim()).Where(keyword => keyword.Length != 0);

        return keywords.Any(keyword => new Regex(keywordRegex).IsMatch(keyword));
    }

    public static Dictionary<string, StandardValidator> Agenda = new()
    {
        // Banner of the stag
        { "01198", new BannerValidator("baratheon", "Baratheon") },
        // Banner of the kraken
        { "01199", new BannerValidator("greyjoy", "Greyjoy") },
        // Banner of the lion
        { "01200", new BannerValidator("lannister", "Lannister") },
        // Banner of the sun
        { "01201", new BannerValidator("martell", "Martell") },
        // Banner of the watch
        { "01202", new BannerValidator("thenightswatch", "Night\"s Watch") },
        // Banner of the wolf
        { "01203", new BannerValidator("stark", "Stark") },
        // Banner of the dragon
        { "01204", new BannerValidator("targaryen", "Targaryen") },
        // Banner of the rose
        { "01205", new BannerValidator("tyrell", "Tyrell") },
        // Fealty
        {
            "01027", new StandardValidator
            {
                Rules = new[]
                {
                    new ValidationRule
                    {
                        Message = "You cannot include more than 15 neutral cards in a deck with Fealty",
                        Condition = deck => deck.CountDrawCards(card => card.Faction == "neutral") <= 15
                    }
                }
            }
        },
        // Kings of Summer
        {
            "04037", new StandardValidator
            {
                CannotInclude = card => card.Type == "plot" && HasTrait(card, "Winter"),
                Rules = new[]
                {
                    new ValidationRule
                    {
                        Message = "Kings of Summer cannot include Winter plot cards",
                        Condition = deck => !deck.PlotCards.Any(cardQuantity => HasTrait(cardQuantity.Card, "Winter"))
                    }
                }

            }
        },
        // Kings of Winter
        {
            "04038", new StandardValidator
            {
                CannotInclude = card => card.Type == "plot" && HasTrait(card, "Summer"),
                Rules = new[]
                {
                    new ValidationRule
                    {
                        Message = "Kings of Winter cannot include Summer plot cards",
                        Condition = deck => !deck.PlotCards.Any(cardQuantity => HasTrait(cardQuantity.Card, "Summer"))
                    }
                }
            }
        },
        // Rains of Castamere
        {
            "05045", new StandardValidator
            {
                RequiredPlots = 12,
                Rules = new[]
                {
                    new ValidationRule
                    {
                        Message = "Rains of Castamere must contain exactly 5 different Scheme plots",
                        Condition = deck =>
                        {
                            var isScheme = (LobbyCard card) => HasTrait(card, "Scheme");
                            var schemePlots = deck.PlotCards.Where(cardQuantity => isScheme(cardQuantity.Card));
                            return schemePlots.Count() == 5 && deck.CountPlotCards(isScheme) == 5;
                        }
                    }
                }
            }
        },
        // Alliance
        {
            "06018", new StandardValidator
            {
                RequiredDraw = 75,
                Rules = new[]
                {
                    new ValidationRule
                    {
                        Message = "Alliance cannot have more than 2 Banner agendas",
                        Condition = deck => !deck.BannerCards.Any() || deck.BannerCards.Length <= 2
                    }
                }
            }
        },
        // The Brotherhood Without Banners
        {
            "06119", new StandardValidator
            {
                CannotInclude = card => card is { Type: "character", Loyal: true },
                Rules = new[]
                {
                    new ValidationRule
                    {
                        Message = "The Brotherhood Without Banners cannot include loyal characters",
                        Condition = deck => !deck.DrawCards.Any(cardQuantity =>
                            cardQuantity.Card.Type == "character" && cardQuantity.Card.Loyal)
                    }
                }
            }
        },
        // The Conclave
        {
            "09045", new StandardValidator
            {
                MayInclude = card => card.Type == "character" && HasTrait(card, "Maester") && !card.Loyal,
                Rules = new[]
                {
                    new ValidationRule
                    {
                        Message = "Must contain 12 or more Maester characters",
                        Condition = deck =>
                            deck.CountDrawCards(card => card.Type == "character" && HasTrait(card, "Maester")) >= 12
                    }
                }
            }
        },
        // The Wars To Come
        {
            "10045", new StandardValidator
            {
                RequiredPlots = 10,
                MaxDoubledPlots = 2
            }
        },
        // The Free Folk
        {
            "11079", new StandardValidator
            {
                CannotInclude = card => card.Faction != "neutral"
            }
        },
        // Kingdom of Shadows
        {
            "13079", new StandardValidator
            {
                MayInclude = card => !card.Loyal && HasKeyword(card, "/ Shadow \\(\\d+\\)/")
            }
        },
        // The White Book
        {
            "13099", new StandardValidator
            {
                MayInclude = card => card.Type == "character" && HasTrait(card, "Kingsguard") && !card.Loyal,
                Rules = new[]
                {
                    new ValidationRule
                    {
                        Message = "Must contain 7 or more different Kingsguard characters",
                        Condition = deck =>
                        {
                            var kingsguardChars = deck.DrawCards.Where(cardQuantity =>
                                cardQuantity.Card.Type == "character" && HasTrait(cardQuantity.Card, "Kingsguard"));
                            return kingsguardChars.Count() >= 7;
                        }
                    }
                }
            }
        },
        // Valyrian Steel
        {
            "13118", new StandardValidator
            {
                RequiredDraw = 75,
                Rules = new[]
                {
                    new ValidationRule
                    {
                        Message = "Cannot include more than 1 copy of each attachment (by title)",
                        Condition = deck =>
                        {
                            var allCards = deck.DrawCards.Concat(deck.PlotCards);
                            var attachmentNames = allCards.Where(cardQuantity => cardQuantity.Card.Type == "attachment")
                                .Select(cardQuantity => cardQuantity.Card.Name);
                            return attachmentNames.All(attachmentName =>
                            {
                                return deck.CountCards(card => card.Name == attachmentName) <= 1;
                            });
                        }
                    }
                }
            }
        },
        // Dark Wings, Dark Words
        {
            "16028", new StandardValidator
            {
                RequiredDraw = 75,
                Rules = new[]
                {
                    new ValidationRule
                    {
                        Message = "Cannot include more than 1 copy of each event (by title)",
                        Condition = deck =>
                        {
                            var allCards = deck.DrawCards.Concat(deck.PlotCards);
                            var eventNames = allCards.Where(cardQuantity => cardQuantity.Card.Type == "event")
                                .Select(cardQuantity => cardQuantity.Card.Name);
                            return eventNames.All(eventName =>
                            {
                                return deck.CountCards(card => card.Name == eventName) <= 1;
                            });
                        }
                    }
                }
            }
        },
        // The Long Voyage
        {
            "16030", new StandardValidator
            {
                RequiredDraw = 100
            }
        },
        // Kingdom of Shadows (Redesign)
        {
            "17148", new StandardValidator
            {
                MayInclude = card => !card.Loyal && HasKeyword(card, "/ Shadow \\(\\d +\\) /")
            }
        },
        // Sea of Blood (Redesign)
        {
            "17149", new StandardValidator
            {
                CannotInclude = card => card is { Faction: "neutral", Type: "event" }
            }
        },
        // The Free Folk (Redesign)
        {
            "17150", new StandardValidator
            {
                MayInclude = card =>
                    card.Faction != "neutral" && card is { Type: "character", Loyal: false } &&
                    HasTrait(card, "Wildling"),
                Rules = new[]
                {
                    new ValidationRule
                    {
                        Message = "Must only contain neutral cards or Non-loyal Wildling characters",
                        Condition = (deck) =>
                        {
                            var drawDeckValid = !deck.DrawCards.Any(cardQuantity =>
                                cardQuantity.Card.Faction != "neutral" &&
                                !(cardQuantity.Card.Type == "character" && !cardQuantity.Card.Loyal &&
                                  HasTrait(cardQuantity.Card, "Wildling")));
                            var plotDeckValid =
                                deck.PlotCards.All(cardQuantity => cardQuantity.Card.Faction == "neutral");
                            return drawDeckValid && plotDeckValid;
                        }
                    }
                }
            }
        },
        // The Wars To Come (Redesign)
        {
            "17151", new StandardValidator
            {
                RequiredPlots = 10,
                MaxDoubledPlots = 2
            }
        },
        // Valyrian Steel (Redesign)
        {
            "17152", new StandardValidator
            {
                RequiredDraw = 75,
                Rules = new[]
                {
                    new ValidationRule
                    {
                        Message = "Cannot include more than 1 copy of each attachment",
                        Condition = deck =>
                        {
                            var allCards = deck.DrawCards.Concat(deck.PlotCards);
                            var attachments = allCards.Where(cardQuantity => cardQuantity.Card.Type == "attachment");
                            return attachments.All(attachment => attachment.Count <= 1);
                        }
                    }
                }
            }
        },
        // A Mummer"s Farce
        {
            "20051", new StandardValidator
            {
                MayInclude = card => card.Type == "character" && HasTrait(card, "Fool") && !card.Loyal
            }
        },
        // The Many-Faced God
        {
            "20052", new StandardValidator
            {
                CannotInclude = card => card.Type == "plot" && HasTrait(card, "Kingdom")
            }
        },
        // Battle of the Trident
        {
            "21030", new StandardValidator
            {
                RequiredPlots = 10,
                Rules = new[]
                {
                    new ValidationRule
                    {
                        Message = "Battle of the Trident must contain exactly 10 Edict, Siege or War plots",
                        Condition = deck =>
                        {
                            return deck.PlotCards.All(cardQuantity =>
                                HasTrait(cardQuantity.Card, "Edict") || HasTrait(cardQuantity.Card, "Siege") ||
                                HasTrait(cardQuantity.Card, "War"));
                        }
                    }
                }
            }
        },
        // Banner of the Falcon
        {
            "23040", new StandardValidator
            {
                Rules = new[]
                {
                    new ValidationRule
                    {
                        Message = "Must contain 12 or more House Arryn cards",
                        Condition = deck => deck.CountDrawCards(card => HasTrait(card, "House Arryn")) >= 12
                    }
                }
            }
        }
    };
}