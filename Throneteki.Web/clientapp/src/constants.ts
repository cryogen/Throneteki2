export const ItemTypes = {
    CARD: 'card',
    PANEL: 'panel'
};

type ContantsType = {
    Factions: string[];
    Stats: string[];
    FactionsImagePaths: { [key: string]: string };
    StatIconImagePaths: { [key: string]: string };
};

export const Constants: ContantsType = {
    Factions: [
        'baratheon',
        'greyjoy',
        'lannister',
        'martell',
        'stark',
        'targaryen',
        'thenightswatch',
        'tyrell'
    ],
    Stats: ['gold', 'totalPower', 'initiative', 'claim', 'reserve'],
    FactionsImagePaths: {},
    StatIconImagePaths: {}
};

for (const faction of Constants.Factions) {
    Constants.FactionsImagePaths[faction] = new URL(
        `./assets/img/factions/${faction}.png`,
        import.meta.url
    ).href;
}

for (const stat of Constants.Stats) {
    Constants.StatIconImagePaths[stat] = new URL(
        `./assets/img/stats/${stat}.png`,
        import.meta.url
    ).href;
}

export const BannersForFaction: Record<string, string> = {
    '01198': 'baratheon',
    '01199': 'greyjoy',
    '01200': 'lannister',
    '01201': 'martell',
    '01202': 'thenightswatch',
    '01203': 'stark',
    '01204': 'targaryen',
    '01205': 'tyrell'
};
