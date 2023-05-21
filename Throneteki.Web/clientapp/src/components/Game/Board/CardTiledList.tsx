import React, { MouseEventHandler } from 'react';

import Card from './Card';
import { CardMouseOverEventArgs, GameCard } from '../../../types/game';
import { CardLocation, CardOrientation, CardSize } from '../../../types/enums';

interface CardTiledListProps {
    cards: GameCard[];
    disableMouseOver: boolean;
    manualMode: boolean;
    onCardClick: (card: GameCard) => void;
    onCardMouseOut: MouseEventHandler;
    onCardMouseOver: (args: CardMouseOverEventArgs) => void;
    size: CardSize;
    source: CardLocation;
    title?: string;
    titleCount?: number;
}

function CardTiledList(props: CardTiledListProps) {
    const cardList =
        props.cards &&
        props.cards.map((card, index: number) => {
            return (
                <Card
                    canDrag={props.manualMode}
                    card={card}
                    disableMouseOver={props.disableMouseOver}
                    key={index}
                    onClick={props.onCardClick}
                    onMouseOut={props.onCardMouseOut}
                    onMouseOver={props.onCardMouseOver}
                    orientation={CardOrientation.Vertical}
                    size={props.size}
                    source={props.source}
                />
            );
        });

    const title =
        props.title && props.cards
            ? `${props.title} (${props.titleCount || props.cards.length})`
            : props.title;

    return (
        <div className='card-list'>
            {title && <div className='card-list-title'>{title}</div>}
            <div className='card-list-cards'>{cardList}</div>
        </div>
    );
}

export default CardTiledList;
