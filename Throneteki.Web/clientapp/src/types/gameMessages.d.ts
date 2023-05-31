import { CardLocation } from './enums';
import { CardMenuItem } from './game';

export interface PromptClicked {
    arg: string;
    command: string;
    method: string;
    promptId: string;
}

export interface CardMenuItemClicked {
    card: string;
    menuItem: CardMenuItem;
}

export interface GameStatChange {
    statToChange: string;
    amount: number;
}

export interface CardDropped {
    uuid: string;
    source: CardLocation;
    target: CardLocation;
}

export interface OptionAndValue {
    option: string;
    value: string | boolean;
}
