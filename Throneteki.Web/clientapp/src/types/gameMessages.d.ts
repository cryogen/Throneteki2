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
