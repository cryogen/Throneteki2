import React from 'react';
import { Image } from 'react-bootstrap';

interface CardImageProps {
    className?: string;
    card: string;
}

const CardImage = ({ card, className }: CardImageProps) => {
    return (
        <Image
            className={`game-card-image${className ? ' ' + className : ''}`}
            fluid
            src={`/img/cards/${card}.png`}
        />
    );
};

export default CardImage;
