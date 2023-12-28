import { GameType } from './enums';
import { ThronetekiUser } from './user';

export interface UserSummary {
    username: string;
    name: string;
    role: string;
    avatar: string;
}

export interface LobbyUser {
    avatar: string;
    username: string;
    role: string;
}

export interface LobbyMessage {
    id: number;
    message: string;
    user: UserSummary;
    time: Date;
    deleted: boolean;
    deletedBy: string;
}

export interface LobbyGame {
    allowSpectators: boolean;
    createdAt: Date;
    full: boolean;
    gamePrivate: boolean;
    gameType: GameType;
    id: string;
    name: string;
    needsPassword: boolean;
    node: string;
    owner: ThronetekiUser;
    players: LobbyGamePlayer[];
    restrictedListId?: string;
    showHand: boolean;
    spectators: UserSummary[];
    started: boolean;
    useChessClocks: boolean;
    useGameTimeLimit: boolean;
}

export interface DeckValidationStatus {
    basicRules: boolean;
    faqJoustRules: boolean;
    faqVersion?: string;
    noBannedCards: boolean;
    noUnreleasedCards: boolean;
    plotCount: number;
    drawCount: number;
    errors: string[];
}

export interface LobbyGamePlayer {
    deckName?: string;
    deckSelected: boolean;
    deckStatus: any;
    user: LobbyUser;
}

export interface HandOff {
    gameId: string;
    name: string;
    url: string;
}

export type Filter = Record<string, boolean>;

export interface News {
    id: number;
    text: string;
    publishedAt: Date;
    publisher: string;
}
