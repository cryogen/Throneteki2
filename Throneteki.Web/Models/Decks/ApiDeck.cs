﻿using Throneteki.Models.Models;

namespace Throneteki.Web.Models.Decks;

public class ApiDeck
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? ExternalId { get; set; }
    public DateTime Created { get; set; }
    public DateTime Updated { get; set; }
    public ApiCard? Agenda { get; set; }
    public ApiFaction Faction { get; set; } = null!;
    public IEnumerable<ApiDeckCard> DeckCards { get; set; } = new List<ApiDeckCard>();
    public bool IsFavourite { get; set; }
    public DeckValidationStatus? Status { get; set; }
    public int Wins { get; set; }
    public int Losses { get; set; }
    public int? WinRate { get; set; }
    public string Owner { get; set; } = null!;
}