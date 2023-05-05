import React from 'react';
import classNames from 'classnames';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import { DeckValidationStatus } from '../../types/lobby';
import { deckStatusLabel } from '../../helpers/DeckHelper';
import DeckStatusSummary from './DeckStatusSummary';

interface DeckStatusProps {
    className?: string;
    status: DeckValidationStatus;
}

const DeckStatus = ({ className = undefined, status }: DeckStatusProps) => {
    const restrictionsFollowed = status.faqJoustRules && status.noUnreleasedCards;
    const spanClass = classNames('deck-status', className, {
        invalid: !status.basicRules || !status.noBannedCards,
        'casual-play': status.basicRules && status.noBannedCards && !restrictionsFollowed,
        valid: status.basicRules && status.noBannedCards && restrictionsFollowed
    });

    const popover = (
        <Popover id='status-popover'>
            <Popover.Body className='bg-dark'>
                <div>
                    <DeckStatusSummary status={status} />
                    {status.errors && status.errors.length !== 0 && (
                        <ul className='deck-status-errors'>
                            {status.errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </Popover.Body>
        </Popover>
    );

    return (
        <span className={spanClass}>
            <OverlayTrigger trigger={['hover', 'focus']} overlay={popover} placement='right'>
                <span>{deckStatusLabel(status)}</span>
            </OverlayTrigger>
        </span>
    );
};

export default DeckStatus;
