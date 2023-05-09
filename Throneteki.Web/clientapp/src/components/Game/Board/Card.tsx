import React, { useState } from 'react';
import classNames from 'classnames';
//import 'jquery-migrate';
import { useDrag } from 'react-dnd';
import { useTranslation } from 'react-i18next';

import CardMenu from './CardMenu';
import CardImage from './CardImage';
import { ItemTypes } from '../../../constants';
import SquishableCardPanel from './SquishableCardPanel';

interface CardProps {
    canDrag: any;
    card: any;
    className?: any;
    disableMouseOver: any;
    halfSize?: boolean;
    isSpectating?: boolean;
    language?: any;
    onClick: any;
    onMenuItemClick?: any;
    onMouseOut: any;
    onMouseOver: any;
    orientation?: any;
    size: any;
    source: any;
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
    orientation = 'vertical',
    size,
    source,
    style,
    wrapped = false
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
        return source === 'play area' && !isSpectating;
    };

    const onCardClicked = (event: any, card: any) => {
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
            case 'small':
                return 0.6;
            case 'large':
                return 1.4;
            case 'x-large':
                return 2;
        }

        return 1;
    };

    const getupgrades = () => {
        if (!['full deck', 'play area'].includes(source) || !card.upgrades) {
            return null;
        }

        const upgrades = card.upgrades.map((upgrade: any, index: any) => {
            const returnedupgrade = (
                <Card
                    canDrag={canDrag}
                    disableMouseOver={disableMouseOver}
                    isSpectating={isSpectating}
                    key={upgrade.uuid}
                    source={source}
                    card={upgrade}
                    className={classNames('upgrade', `upgrade-${index + 1}`)}
                    wrapped={false}
                    onMouseOver={
                        !disableMouseOver && onMouseOver
                            ? (upgrade: any) => onMouseOver(upgrade)
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

            return returnedupgrade;
        });

        return upgrades;
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
                source='underneath'
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

    const getDragFrame = (image: any) => {
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

    const getCardName = (card: any) => {
        if (i18n.language === 'en') {
            return card.name;
        }
        return card.locale && card.locale[i18n.language]
            ? card.locale[i18n.language].name
            : card.name;
    };

    const imageUrl = () => {
        let image = 'cardback.jpg';

        if (!isFacedown()) {
            image = `${card.code}.png`;
        } else if (source === 'shadows') {
            image = 'cardback_shadow.png';
        }

        return '/img/cards/' + image;
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
                horizontal: orientation !== 'vertical' || card.kneeled,
                vertical: orientation === 'vertical' && !card.kneeled,
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
        const imageClass = classNames(
            'card-image vertical',
            sizeClass,
            halfSize ? 'halfSize' : '',
            {
                kneeled: orientation === 'kneeled' || card.kneeled || orientation === 'horizontal'
            }
        );
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
                                      image: <CardImage card={{ ...card, location: 'zoom' }} />,
                                      size: 'normal'
                                  })
                            : undefined
                    }
                    onMouseOut={!disableMouseOver && !isFacedown() ? onMouseOut : undefined}
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
                        onMenuItemClick={(menuItem: any) => {
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
    if (card.upgrades) {
        styleCopy.top = card.upgrades.length * (15 * getCardSizeMultiplier());
    }
    if (wrapped) {
        return (
            <div className='card-wrapper' style={style}>
                {getCard()}
                {getupgrades()}
                {renderUnderneathCards()}
            </div>
        );
    }

    return getCard();
};

export default Card;
