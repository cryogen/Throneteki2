import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import CardImage from './CardImage';
import CardPilePopup from './CardPilePopup';

interface CardPileLinkProps {
    cards: any;
    className: any;
    closeOnClick?: boolean;
    disableMouseOver?: boolean;
    disablePopup?: boolean;
    hiddenTopCard?: boolean;
    manualMode: any;
    numDeckCards?: number;
    onCardClick: any;
    onDragDrop: any;
    onMouseOut: any;
    onMouseOver: any;
    onPopupChange: any;
    onTouchMove: any;
    orientation?: any;
    popupLocation: any;
    popupMenu?: any;
    size: any;
    source: any;
    title: any;
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
    onTouchMove,
    orientation = 'vertical',
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

        if (cards?.some((card: any) => card.selectable)) {
            updatePopupVisibility(true);
        } else {
            updatePopupVisibility(false);
        }
    }, [cards, manualPopup, updatePopupVisibility]);

    const classNameStr = classNames('card-pile-link', className, {
        horizontal: orientation === 'horizontal' || orientation === 'exhausted',
        vertical: orientation === 'vertical'
    });

    const topCard = () => {
        if (cards.length === 0) {
            return;
        }
        const card = cards[0];
        if (!card.facedown && card.location !== 'deck') {
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
                            image: <CardImage card={{ ...card, location: 'zoom' }} />,
                            size: 'normal'
                        })
                    }
                    onMouseOut={onMouseOut}
                >
                    <CardImage card={card} orientation='vertical' size='icon' />
                </div>
            )}
            <div className={'text ' + title.toLowerCase()}>{title}:</div>&nbsp;
            <div className={'counter ' + title.toLowerCase()}>
                {source === 'deck' ? numDeckCards : cards.length}
            </div>
            {!disablePopup && showPopup && (
                <CardPilePopup
                    cards={cards}
                    disableMouseOver={disableMouseOver}
                    manualMode={manualMode}
                    onCardClick={(card: any) => {
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
                    onTouchMove={onTouchMove}
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
