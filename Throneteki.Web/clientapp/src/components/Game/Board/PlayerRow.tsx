import React from 'react';
import { useTranslation } from 'react-i18next';
import Droppable from './Droppable';
import SquishableCardPanel from './SquishableCardPanel';
import { CardLocation, CardSize } from '../../../types/enums';
import { CardMouseOverEventArgs, GameCard } from '../../../types/game';

interface PlayerRowProps {
    cardSize: CardSize;
    hand: GameCard[];
    isMe: boolean;
    manualMode: boolean;
    onCardClick: (card: GameCard) => void;
    onDragDrop?: (card: GameCard, source: CardLocation, target: CardLocation) => void;
    onMouseOut: (card: GameCard) => void;
    onMouseOver: (args: CardMouseOverEventArgs) => void;
}

const PlayerRow = ({
    cardSize,
    hand,
    isMe,
    manualMode,
    onCardClick,
    onDragDrop,
    onMouseOut,
    onMouseOver
}: PlayerRowProps) => {
    const { t } = useTranslation();

    const handToRender = (
        <SquishableCardPanel
            cards={hand}
            className='panel hand'
            groupVisibleCards
            manualMode={manualMode}
            maxCards={5}
            onCardClick={onCardClick}
            onMouseOut={onMouseOut}
            onMouseOver={onMouseOver}
            source={CardLocation.Hand}
            title={t('Hand')}
            cardSize={cardSize}
        />
    );

    return isMe ? (
        <div className='d-flex pt-1'>
            <Droppable onDragDrop={onDragDrop} source={CardLocation.Hand} manualMode={manualMode}>
                {handToRender}
            </Droppable>
        </div>
    ) : null;
};

export default PlayerRow;
