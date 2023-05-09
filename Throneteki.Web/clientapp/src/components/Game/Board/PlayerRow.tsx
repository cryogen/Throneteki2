import React from 'react';
import { useTranslation } from 'react-i18next';
import Droppable from './Droppable';
import SquishableCardPanel from './SquishableCardPanel';

interface PlayerRowProps {
    cardSize: any;
    hand: any;
    isMe: boolean;
    manualMode: boolean;
    onCardClick: any;
    onDragDrop: any;
    onMouseOut: any;
    onMouseOver: any;
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
            source='hand'
            title={t('Hand')}
            cardSize={cardSize}
        />
    );

    return isMe ? (
        <div className='d-flex pt-1'>
            <Droppable onDragDrop={onDragDrop} source='hand' manualMode={manualMode}>
                {handToRender}
            </Droppable>
        </div>
    ) : null;
};

export default PlayerRow;
