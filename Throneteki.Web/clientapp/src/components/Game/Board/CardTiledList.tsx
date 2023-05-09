import React from 'react';

import Card from './Card';

interface CardTiledListProps {
    cards: any;
    disableMouseOver: boolean;
    manualMode: boolean;
    onCardClick: any;
    onCardMouseOut: any;
    onCardMouseOver: any;
    size: string;
    source: string;
    title?: string;
    titleCount?: number;
}

function CardTiledList(props: CardTiledListProps) {
    const cardList =
        props.cards &&
        props.cards.map((card: any, index: number) => {
            return (
                <Card
                    canDrag={props.manualMode}
                    card={card}
                    disableMouseOver={props.disableMouseOver}
                    key={index}
                    onClick={props.onCardClick}
                    onMouseOut={props.onCardMouseOut}
                    onMouseOver={props.onCardMouseOver}
                    orientation='vertical'
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
