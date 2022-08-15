interface ContantsType {
    Factions: string[];
    FactionsImagePaths: Record<string, string>;
}

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
    FactionsImagePaths: {}
};

for (const faction of Constants.Factions) {
    Constants.FactionsImagePaths[faction] = require(`./assets/img/factions/${faction}.png`);
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
