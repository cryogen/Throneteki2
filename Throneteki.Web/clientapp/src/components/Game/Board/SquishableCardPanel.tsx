import React from 'react';
import classNames from 'classnames';
import Card from './Card';
import { useTranslation } from 'react-i18next';
import { CardLocation, CardSize } from '../../../types/enums';
import { CardMouseOverEventArgs, GameCard } from '../../../types/game';

interface SquishableCardPanelProps {
    cardSize: CardSize;
    cards: GameCard[];
    className: string;
    groupVisibleCards?: boolean;
    manualMode?: boolean;
    onCardClick: (card: GameCard) => void;
    onMouseOut: (card: GameCard) => void;
    onMouseOver: (args: CardMouseOverEventArgs) => void;
    source: CardLocation;
    title?: string;
    maxCards: number;
}

const SquishableCardPanel = ({
    cardSize,
    cards,
    className,
    groupVisibleCards = true,
    manualMode = true,
    onCardClick,
    onMouseOut,
    onMouseOver,
    source,
    title = undefined,
    maxCards
}: SquishableCardPanelProps) => {
    const { i18n } = useTranslation();

    const getCards = (needsSquish: boolean) => {
        const overallDimensions = getOverallDimensions();
        const dimensions = getCardDimensions();

        let cardsToRender = cards;
        let cardIndex = 0;
        const handLength = cardsToRender ? cardsToRender.length : 0;
        const cardWidth = dimensions.width;

        const requiredWidth = handLength * cardWidth;
        const overflow = requiredWidth - overallDimensions.width;
        const offset = overflow / (handLength - 1);

        if (groupVisibleCards && hasMixOfVisibleCards()) {
            cardsToRender = [...cards].sort((a, b) => (a.facedown && !b.facedown ? -1 : 1));
        }

        const hand = cardsToRender.map((card: GameCard) => {
            const left = (cardWidth - offset) * cardIndex++;

            let style = {};
            if (needsSquish) {
                style = {
                    left: left + 'px'
                };
            }

            return (
                <Card
                    key={card.uuid}
                    card={card}
                    disableMouseOver={!card.name}
                    canDrag={manualMode}
                    onClick={onCardClick}
                    onMouseOver={onMouseOver}
                    onMouseOut={onMouseOut}
                    size={cardSize}
                    style={style}
                    language={i18n.language}
                    source={source}
                />
            );
        });

        return hand;
    };

    const hasMixOfVisibleCards = () => {
        return (
            cards.some((card: GameCard) => !!card.code) &&
            cards.some((card: GameCard) => !card.code)
        );
    };

    const getCardSizeMultiplier = () => {
        switch (cardSize) {
            case 'small':
                return 0.6;
            case 'large':
                return 1.4;
            case 'x-large':
                return 2;
        }

        return 1;
    };

    const getCardDimensions = () => {
        const multiplier = getCardSizeMultiplier();
        return {
            width: 65 * multiplier,
            height: 91 * multiplier
        };
    };

    const getOverallDimensions = () => {
        const cardDimensions = getCardDimensions();
        return {
            width: (cardDimensions.width + 7) * Math.min(maxCards, cards ? cards.length : 5),
            height: cardDimensions.height
        };
    };

    const dimensions = getOverallDimensions();
    const needsSquish = cards?.length > maxCards;
    const cardsToRender = getCards(needsSquish);

    const divClassName = classNames('squishable-card-panel', className, {
        [cardSize]: cardSize !== 'normal',
        squish: needsSquish
    });

    const style = {
        width: dimensions.width + 'px',
        height: dimensions.height + 'px'
    };

    return (
        <div className={divClassName} style={style}>
            {title && <div className='panel-header'>{`${title} (${cardsToRender.length})`}</div>}
            {cardsToRender}
        </div>
    );
};

export default SquishableCardPanel;
