import React from 'react';
import { Image } from 'react-bootstrap';
import classNames from 'classnames';

interface CardImageProps {
    className?: string;
    card: string;
    size?: 'sm' | 'md' | 'lg';
}

const CardImage = ({ card, className, size = 'sm' }: CardImageProps) => {
    const classString = classNames('game-card-image', className, size);

    return <Image className={classString} fluid src={`/img/cards/${card}.png`} />;
};

export default CardImage;
