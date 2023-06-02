import { Card, Pack } from '../types/data';
import { DeckValidationStatus } from '../types/lobby';

export interface CardLookupArg {
    cardName: string;
    cards: Card[];
    packs: Pack[];
}

export function lookupCardByName({ cardName, cards, packs }: CardLookupArg) {
    const pattern = /^([^()[\]]+)(\s+\((.+)\))?(\s+\[.+\])?$/;

    const match = cardName.trim().match(pattern);

    if (!match) {
        return;
    }

    const shortName = match[1].trim().toLowerCase();
    const packName = match[3] && match[3].trim().toLowerCase();
    const pack =
        packName &&
        packs.find(
            (pack) => pack.code.toLowerCase() === packName || pack.name.toLowerCase() === packName
        );

    const matchingCards = cards.filter((card) => {
        if (pack) {
            return pack.code === card.packCode && card.name.toLowerCase() === shortName;
        }

        return card.name.toLowerCase() === shortName;
    });

    matchingCards.sort((a, b) => compareCardByReleaseDate(a, b, packs));

    return matchingCards[0];
}

function compareCardByReleaseDate(a: Card, b: Card, packs: Pack[]) {
    const packA = packs.find((pack) => pack.code === a.packCode);
    const packB = packs.find((pack) => pack.code === b.packCode);

    if (!packA || !packB) {
        throw new Error('Pack not found');
    }

    if (!packA.releaseDate && packB.releaseDate) {
        return 1;
    }

    if (!packB.releaseDate && packA.releaseDate) {
        return -1;
    }

    return new Date(packA.releaseDate) < new Date(packB.releaseDate) ? -1 : 1;
}

export function deckStatusLabel(status: DeckValidationStatus) {
    if (!status.basicRules) {
        return 'Invalid';
    }

    if (!status.noBannedCards) {
        return 'Banned';
    }

    if (!status.faqJoustRules || !status.noUnreleasedCards) {
        return 'Casual';
    }

    return 'Legal';
}

export function cardSetLabel(cardSet: string) {
    switch (cardSet) {
        case 'redesign':
            return 'Standard';
        case 'original':
            return 'Valyrian';
    }

    return 'Unknown';
}
