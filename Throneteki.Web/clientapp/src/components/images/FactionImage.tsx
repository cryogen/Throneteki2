import React from 'react';
import classNames from 'classnames';
import { Image } from '@nextui-org/react';

import { Constants } from '../../constants';
import './FactionImage.css';

interface FactionImageProps {
    className?: string;
    faction: string;
    onMouseMove?: React.MouseEventHandler;
    onMouseOut?: React.MouseEventHandler;
    onMouseOver?: React.MouseEventHandler;
    size?: 'sm' | 'md' | 'lg';
}

const FactionImage = ({
    className,
    faction,
    onMouseMove,
    onMouseOut,
    onMouseOver,
    size = 'sm'
}: FactionImageProps) => {
    const classString = classNames(className, size);
    return (
        <div
            className='faction-image'
            onMouseMove={onMouseMove}
            onMouseOut={onMouseOut}
            onMouseOver={onMouseOver}
        >
            <Image
                className={classString}
                src={Constants.FactionsImagePaths[faction]}
                radius='sm'
            />
        </div>
    );
};

export default FactionImage;
