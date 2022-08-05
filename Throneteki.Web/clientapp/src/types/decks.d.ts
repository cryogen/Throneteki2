export interface Deck {
    name: string;
    faction: number;
    agenda: number | undefined;
    bannerCards: number[] | undefined;
    plotCards: { [number: number]: number };
    drawCards: { [number: number]: number };
}

export interface ThronesDbDeck {
    id: number;
    name: string;
    date_creation: Date;
    date_update: Date;
    description_md: string;
    user_id: number;
    faction_code: string;
    faction_name: string;
    slots: { [code: string]: number } | string[];
    agendas: string[];
    agendaurls: string[];
    version: string;
    problem: string | null;
    tags: string;
    uuid: string;
    is_synced?: boolean;
}
