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
