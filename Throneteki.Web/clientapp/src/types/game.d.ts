import { Card } from './data';

export interface CardPiles {
    bannerCards: Card[];
    cardsInPlay: Card[];
    conclavePile: Card[];
    deadPile: Card[];
    discardPile: Card[];
    drawDeck: Card[];
    hand: Card[];
    outOfGamePile: Card[];
    plotDeck: Card[];
    plotDiscard: Card[];
    shadows: Card[];
}

export interface GamePlayer {
    controls: any;
    menuTitle: any;
    promptTitle: any;
    phase: any;
    buttons: any;
    deckData: any;
    numDeckCards: any;
    activePlayer: boolean;
    selectCard?: boolean;
    activePlot?: Card | null;
    agenda?: Card | null;
    cardPiles: CardPiles;
    faction?: Faction;
    firstPlayer: boolean;
    numDrawCards: number;
    plotSelected: boolean;
    stats: GamePlayerStats;
    title?: any;
    user?: any;
    name: string;
}

export interface Game {
    muteSpectators: boolean;
    messages: any;
    allowSpectators: boolean;
    createdAt: Date;
    full: boolean;
    gamePrivate: boolean;
    gameType: GameType;
    id: string;
    name: string;
    needsPassword: boolean;
    node: string;
    owner: string;
    players: { [name: string]: GamePlayer };
    showHand: boolean;
    spectators: UserSummary[];
    started: boolean;
    useChessClocks: boolean;
    useGameTimeLimit: boolean;
}

export interface GamePlayerStats {
    claim: number;
    initiative: number;
    gold: number;
    reserve: number;
    totalPower: number;
}

export type StatsIndexer = 'claim' | 'initiative' | 'gold' | 'reserve' | 'totalPower';
