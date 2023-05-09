import React from 'react';
import { useTranslation } from 'react-i18next';
import CardPileLink from './CardPileLink';
import Droppable from './Droppable';

interface DrawDeckProps {
    cardCount: number;
    cards: any;
    isMe: boolean;
    manualMode: boolean;
    numDeckCards: number;
    onCardClick: any;
    onDragDrop: any;
    onMenuItemClick: any;
    onMouseOut: any;
    onMouseOver: any;
    onPopupChange: any;
    onShuffleClick: any;
    onTouchMove: any;
    popupLocation: any;
    showDeck?: boolean;
    size: any;
    spectating: boolean;
}

const DrawDeck = (props: DrawDeckProps) => {
    const { t } = useTranslation();
    const {
        cards,
        isMe,
        manualMode,
        onDragDrop,
        onPopupChange,
        onShuffleClick,
        showDeck = false,
        spectating
    } = props;

    const drawDeckPopupMenu = showDeck
        ? [{ text: 'Close and Shuffle', handler: () => onShuffleClick && onShuffleClick() }]
        : null;

    const hasCards = cards?.length !== 0;

    const drawDeck = (
        <CardPileLink
            {...props}
            className='draw'
            disablePopup={!hasCards && (spectating || !isMe)}
            hiddenTopCard
            onPopupChange={(event: any) =>
                onPopupChange && !event.visible && onPopupChange({ visible: false })
            }
            popupMenu={drawDeckPopupMenu}
            source='deck'
            cards={cards}
            title={t('Draw')}
        />
    );

    return isMe ? (
        <Droppable onDragDrop={onDragDrop} source='deck' manualMode={manualMode}>
            {drawDeck}
        </Droppable>
    ) : (
        drawDeck
    );
};

export default DrawDeck;
