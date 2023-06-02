import React from 'react';

import { DeckValidationStatus } from '../../types/lobby';
import { deckStatusLabel } from '../../helpers/DeckHelper';
import { Badge } from 'react-bootstrap';

interface DeckStatusLabelProps {
    className?: string;
    status: DeckValidationStatus;
}

const DeckStatusLabel = ({ className = '', status }: DeckStatusLabelProps) => {
    const text = status ? deckStatusLabel(status) : 'Loading...';
    const restrictionsFollowed = status.faqJoustRules && status.noUnreleasedCards;

    let bg = 'light';

    if (!status.basicRules || !status.noBannedCards) {
        bg = 'danger';
    } else if (status.basicRules && status.noBannedCards && !restrictionsFollowed) {
        bg = 'warning';
    } else if (status.basicRules && status.noBannedCards && restrictionsFollowed) {
        bg = 'success';
    }

    return (
        <Badge className={className} pill bg={bg}>
            {text}
        </Badge>
    );
};

export default DeckStatusLabel;
