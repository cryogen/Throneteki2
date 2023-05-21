import React from 'react';
import { GameCard } from '../../../types/game';
import { CardOrientation, CardSize } from '../../../types/enums';

interface CardImageProps {
    card: GameCard;
    orientation?: CardOrientation;
    halfSize?: boolean;
    size?: CardSize;
}

const CardImage = ({ card, halfSize, orientation, size }: CardImageProps) => {
    return <div>CardImage</div>;
};

export default CardImage;
