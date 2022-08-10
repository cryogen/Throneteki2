import React from 'react';
import { Image } from 'react-bootstrap';
import classNames from 'classnames';

interface CardImageProps {
    className?: string;
    card: string;
    size?: 'sm' | 'md' | 'lg';
}

const CardImage = ({ card, className, size = 'sm' }: CardImageProps) => {
    const classString = classNames(className, size);

    return (
        <div className='game-card-image'>
            <Image className={classString} fluid src={`/img/cards/${card}.png`} />
        </div>
    );
};

export default CardImage;
