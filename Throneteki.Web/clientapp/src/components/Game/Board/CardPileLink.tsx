import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import CardImage from './CardImage';
import CardPilePopup from './CardPilePopup';
import {
    CardMouseOverEventArgs,
    GameCard,
    PopupChangeEventArgs,
    PopupMenuItem
} from '../../../types/game';
import { MouseEventHandler } from 'react';
import { BoardSide, CardLocation, CardOrientation, CardSize } from '../../../types/enums';

interface CardPileLinkProps {
    cards: GameCard[];
    className: string;
    closeOnClick?: boolean;
    disableMouseOver?: boolean;
    disablePopup?: boolean;
    hiddenTopCard?: boolean;
    manualMode: boolean;
    numDeckCards?: number;
    onCardClick: (card: GameCard) => void;
    onDragDrop: (card: GameCard) => void;
    onMouseOut: MouseEventHandler;
    onMouseOver: (args: CardMouseOverEventArgs) => void;
    onPopupChange?: (args: PopupChangeEventArgs) => void;
    orientation?: CardOrientation;
    popupLocation: BoardSide;
    popupMenu?: PopupMenuItem[];
    size: CardSize;
    source: CardLocation;
    title: string;
}

const CardPileLink = ({
    cards,
    className,
    closeOnClick = false,
    disableMouseOver = false,
    disablePopup,
    hiddenTopCard = false,
    manualMode,
    numDeckCards = 0,
    onCardClick,
    onDragDrop,
    onMouseOut,
    onMouseOver,
    onPopupChange,
    orientation = CardOrientation.Vertical,
    popupLocation,
    popupMenu,
    size,
    source,
    title
}: CardPileLinkProps) => {
    const [showPopup, setShowPopup] = useState(false);
    const [manualPopup, setManualPopup] = useState(false);
    const updatePopupVisibility = useCallback(
        (value: boolean) => {
            setShowPopup(value);

            onPopupChange && onPopupChange({ source: source, visible: value });
        },
        [source, onPopupChange]
    );

    useEffect(() => {
        if (manualPopup) {
            return;
        }

        if (cards?.some((card) => card.selectable)) {
            updatePopupVisibility(true);
        } else {
            updatePopupVisibility(false);
        }
    }, [cards, manualPopup, updatePopupVisibility]);

    const classNameStr = classNames('card-pile-link', className, {
        horizontal: orientation === CardOrientation.Horizontal,
        vertical: orientation === CardOrientation.Vertical
    });

    const topCard = () => {
        if (cards.length === 0) {
            return;
        }
        const card = cards[0];
        if (!card.facedown && card.location !== CardLocation.Draw) {
            return card;
        }
    };

    const card = topCard();

    return (
        <div
            className={classNameStr}
            onClick={() => {
                if (!disablePopup) {
                    updatePopupVisibility(!showPopup);
                    setManualPopup(!showPopup);
                }
            }}
        >
            {card && (
                <div
                    className='icon'
                    onMouseOver={() =>
                        onMouseOver({
                            image: <CardImage card={{ ...card, location: CardLocation.Zoom }} />,
                            size: 'normal'
                        })
                    }
                    onMouseOut={onMouseOut}
                >
                    <CardImage
                        card={card}
                        orientation={CardOrientation.Vertical}
                        size={CardSize.Icon}
                    />
                </div>
            )}
            <div className={'text ' + title.toLowerCase()}>{title}:</div>&nbsp;
            <div className={'counter ' + title.toLowerCase()}>
                {source === CardLocation.Draw ? numDeckCards : cards.length}
            </div>
            {!disablePopup && showPopup && (
                <CardPilePopup
                    cards={cards}
                    disableMouseOver={disableMouseOver}
                    manualMode={manualMode}
                    onCardClick={(card) => {
                        if (closeOnClick) {
                            updatePopupVisibility(false);
                            setManualPopup(false);
                        }

                        onCardClick && onCardClick(card);
                    }}
                    onCloseClick={() => {
                        updatePopupVisibility(!showPopup);
                        setManualPopup(!showPopup);
                    }}
                    onDragDrop={onDragDrop}
                    onMouseOut={onMouseOut}
                    onMouseOver={onMouseOver}
                    popupLocation={popupLocation}
                    popupMenu={popupMenu}
                    size={size}
                    source={source}
                    title={title}
                />
            )}
        </div>
    );
};

export default CardPileLink;
