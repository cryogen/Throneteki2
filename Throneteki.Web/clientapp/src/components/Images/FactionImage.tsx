import React from 'react';
import { Image } from 'react-bootstrap';
import classNames from 'classnames';

import { Constants } from '../../constants';

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
            <Image className={classString} fluid src={Constants.FactionsImagePaths[faction]} />
        </div>
    );
};

export default FactionImage;
