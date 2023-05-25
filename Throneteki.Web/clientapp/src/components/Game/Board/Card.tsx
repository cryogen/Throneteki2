import React, { useState } from 'react';
import classNames from 'classnames';
import { useDrag } from 'react-dnd';
import { useTranslation } from 'react-i18next';

import CardMenu from './CardMenu';
import CardImage from './CardImage';
import { ItemTypes } from '../../../constants';
import SquishableCardPanel from './SquishableCardPanel';
import { CardLocation, CardOrientation, CardSize } from '../../../types/enums';

import CardBack from '../../../assets/img/cardback.png';
import CardBackShadow from '../../../assets/img/cardback_shadow.png';
import { CardMenuItem, CardMouseOverEventArgs, GameCard } from '../../../types/game';

interface CardProps {
    canDrag: boolean;
    card: GameCard;
    className?: string;
    disableMouseOver: boolean;
    halfSize?: boolean;
    isSpectating?: boolean;
    language?: string;
    onClick: (card: GameCard) => void;
    onMenuItemClick?: (card: GameCard, menuItem: CardMenuItem) => void;
    onMouseOut: (card: GameCard) => void;
    onMouseOver?: (args: CardMouseOverEventArgs) => void;
    orientation?: CardOrientation;
    size: CardSize;
    source: CardLocation;
    style?: any;
    wrapped?: boolean;
}

const Card = ({
    canDrag,
    card,
    className,
    disableMouseOver,
    halfSize = false,
    isSpectating = false,
    onClick,
    onMenuItemClick,
    onMouseOut,
    onMouseOver,
    orientation = CardOrientation.Vertical,
    size,
    source,
    style,
    wrapped = true
}: CardProps) => {
    const { i18n } = useTranslation();

    const sizeClass = {
        [size]: size !== 'normal'
    };

    const [showMenu, setShowMenu] = useState(false);

    const [{ dragOffset, isDragging }, drag, preview] = useDrag(() => ({
        type: ItemTypes.CARD,
        item: { card: card, source: source, type: ItemTypes.CARD },
        canDrag: () => canDrag || (!card.unselectable && card.canPlay),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
            dragOffset: monitor.getSourceClientOffset()
        })
    }));

    const isAllowedMenuSource = () => {
        return source === CardLocation.PlayArea && !isSpectating;
    };

    const onCardClicked = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, card: GameCard) => {
        event.preventDefault();
        event.stopPropagation();
        if (isAllowedMenuSource() && card.menu && card.menu.length !== 0) {
            setShowMenu(!showMenu);
            return;
        }

        onClick && onClick(card);
    };
    const getCardSizeMultiplier = () => {
        switch (size) {
            case CardSize.Small:
                return 0.6;
            case CardSize.Large:
                return 1.4;
            case CardSize.ExtraLarge:
                return 2;
        }

        return 1;
    };

    const getAttachments = () => {
        if (![CardLocation.FullDeck, CardLocation.PlayArea].includes(source) || !card.attachments) {
            return null;
        }

        const attachments = card.attachments.map((attachment, index) => {
            const returnedAttachment = (
                <Card
                    canDrag={canDrag}
                    disableMouseOver={disableMouseOver}
                    isSpectating={isSpectating}
                    key={index}
                    source={source}
                    card={attachment}
                    className={classNames('attachment', `attachment-${index + 1}`)}
                    wrapped={false}
                    onMouseOver={
                        !disableMouseOver && onMouseOver
                            ? (attachment) => onMouseOver(attachment)
                            : undefined
                    }
                    onMouseOut={!disableMouseOver && onMouseOut}
                    onClick={onClick}
                    onMenuItemClick={onMenuItemClick}
                    orientation={orientation}
                    size={size}
                    style={style}
                    halfSize={halfSize}
                />
            );

            return returnedAttachment;
        });

        return attachments;
    };

    const renderUnderneathCards = () => {
        // TODO: Right now it is assumed that all cards in the childCards array
        // are being placed underneath the current card. In the future there may
        // be other types of cards in this array and it should be filtered.
        const underneathCards = card.childCards;
        if (!underneathCards || underneathCards.length === 0) {
            return;
        }

        const maxCards = 1 + (underneathCards.length - 1) / 6;
        return (
            <SquishableCardPanel
                cardSize={size}
                cards={underneathCards}
                className='underneath'
                maxCards={maxCards}
                onCardClick={onClick}
                onMouseOut={onMouseOut}
                onMouseOver={onMouseOver}
                source={CardLocation.Underneath}
            />
        );
    };

    const getCardOrdering = () => {
        if (!card.order) {
            return null;
        }

        return <div className='card-ordering'>{card.order}</div>;
    };

    const shouldShowMenu = () => {
        if (!isAllowedMenuSource()) {
            return false;
        }

        if (!card.menu || !showMenu) {
            return false;
        }

        return true;
    };

    const isFacedown = () => {
        return card.facedown || !card.name;
    };

    const getDragFrame = (image: JSX.Element) => {
        if (!isDragging) {
            return null;
        }

        let style = {};
        if (dragOffset && isDragging) {
            const x = dragOffset.x;
            const y = dragOffset.y;
            style = {
                left: x,
                top: y
            };
        }

        return (
            <div className='drag-preview' style={style} ref={preview}>
                {image}
            </div>
        );
    };

    const getCardName = (card: GameCard) => {
        if (i18n.language === 'en') {
            return card.name;
        }
        return card.locale && card.locale[i18n.language]
            ? card.locale[i18n.language].name
            : card.name;
    };

    const imageUrl = () => {
        let image = CardBack;

        if (!isFacedown()) {
            image = `/img/cards/${card.code}.png`;
        } else if (source === CardLocation.Shadows) {
            image = CardBackShadow;
        }

        return image;
    };

    const getCard = () => {
        if (!card) {
            return <div />;
        }

        const statusClass = getStatusClass();

        const cardClass = classNames(
            'game-card',
            `card-type-${card.type}`,
            className,
            sizeClass,
            halfSize ? 'halfSize' : '',
            statusClass,
            {
                'custom-card': card.code && card.code.startsWith('custom'),
                horizontal: orientation !== CardOrientation.Vertical || card.kneeled,
                vertical: orientation === CardOrientation.Vertical && !card.kneeled,
                'can-play':
                    statusClass !== 'selected' &&
                    statusClass !== 'selectable' &&
                    !card.unselectable &&
                    card.canPlay,
                unselectable: card.unselectable,
                dragging: isDragging,
                controlled: card.controlled
            }
        );
        const imageClass = classNames('card-image', sizeClass, {
            horizontal: card.type === 'plot',
            vertical: card.type !== 'plot',
            kneeled:
                card.type !== 'plot' &&
                (orientation === CardOrientation.Kneeled ||
                    card.kneeled ||
                    orientation === CardOrientation.Horizontal)
        });
        const image = <img className={imageClass} src={imageUrl()} />;
        return (
            <div className='card-frame' ref={drag}>
                {getDragFrame(image)}
                {getCardOrdering()}
                <div
                    className={cardClass}
                    onMouseOver={
                        !disableMouseOver && !isFacedown() && onMouseOver
                            ? () =>
                                  onMouseOver({
                                      image: (
                                          <CardImage
                                              card={{ ...card, location: CardLocation.Zoom }}
                                          />
                                      ),
                                      size: 'normal'
                                  })
                            : undefined
                    }
                    onMouseOut={!disableMouseOver && !isFacedown() ? () => onMouseOut : undefined}
                    onClick={(event) => onCardClicked(event, card)}
                >
                    <div>
                        <span className='card-name'>{getCardName(card)}</span>
                        {image}
                    </div>
                </div>
                {shouldShowMenu() && (
                    <CardMenu
                        menu={card.menu}
                        onMenuItemClick={(menuItem: CardMenuItem) => {
                            onMenuItemClick && onMenuItemClick(card, menuItem);
                            setShowMenu(!showMenu);
                        }}
                    />
                )}
            </div>
        );
    };

    const getStatusClass = () => {
        if (!card) {
            return undefined;
        }

        if (card.selected) {
            return 'selected';
        } else if (card.selectable) {
            return 'selectable';
        } else if (card.new) {
            return 'new';
        }

        return undefined;
    };

    const styleCopy = Object.assign({}, style);
    if (card.attachments) {
        styleCopy.top = card.attachments.length * (15 * getCardSizeMultiplier());
    }
    if (wrapped) {
        return (
            <div className='card-wrapper' style={style}>
                {getCard()}
                {getAttachments()}
                {renderUnderneathCards()}
            </div>
        );
    }

    return getCard();
};

export default Card;
