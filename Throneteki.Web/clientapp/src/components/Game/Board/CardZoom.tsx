import React from 'react';

import { CardMouseOverEventArgs } from '../../../types/game';

interface CardZoomProps {
    card: CardMouseOverEventArgs;
}

const CardZoom = ({ card }: CardZoomProps) => {
    return <div className={`card-zoom ${card.size} vertical shadow`}>{card.image}</div>;
};

CardZoom.displayName = 'CardZoom';

export default CardZoom;
