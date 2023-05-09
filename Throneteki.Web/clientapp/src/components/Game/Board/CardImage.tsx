import React from 'react';

interface CardImageProps {
    card: any;
    cardBack?: any;
    orientation?: any;
    halfSize?: any;
    size?: any;
}

const CardImage = ({ card, cardBack, halfSize, orientation, size }: CardImageProps) => {
    return <div>CardImage</div>;
};

export default CardImage;
