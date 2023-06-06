import React from 'react';
import { Image } from 'react-bootstrap';
import classNames from 'classnames';

interface CardImageProps {
    className?: string;
    imageUrl: string;
    size?: 'sm' | 'md' | 'lg';
    selected?: boolean;
}

const CardImage = ({ imageUrl, className, size = 'sm', selected = false }: CardImageProps) => {
    const imageClass = classNames(className, size);
    const containerClass = classNames('game-card-image', {
        selected: selected
    });

    return (
        <div className={containerClass}>
            <Image className={imageClass} fluid src={imageUrl} />
        </div>
    );
};

export default CardImage;
