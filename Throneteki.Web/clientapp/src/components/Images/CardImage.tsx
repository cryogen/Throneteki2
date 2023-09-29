import classNames from 'classnames';
import { Image } from '@nextui-org/react';

import './CardImage.css';

interface CardImageProps {
    className?: string;
    imageUrl: string;
    size?: 'sm' | 'md' | 'lg';
    selected?: boolean;
}

const CardImage = ({ imageUrl, className, size = 'sm', selected = false }: CardImageProps) => {
    const imageClass = classNames(className, size);
    const containerClass = classNames('game-card-image', {
        'outline outline-4 outline-green-600': selected
    });

    return (
        <div className={containerClass}>
            <Image className={imageClass} src={imageUrl} radius='md' />
        </div>
    );
};

export default CardImage;
