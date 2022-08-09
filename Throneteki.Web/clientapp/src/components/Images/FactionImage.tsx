import React from 'react';
import { Image } from 'react-bootstrap';
import classNames from 'classnames';

import { Constants } from '../../constants';

interface FactionImageProps {
    className?: string;
    faction: string;
    size?: 'sm' | 'md' | 'lg';
}

const FactionImage = ({ faction, className, size = 'sm' }: FactionImageProps) => {
    const classString = classNames('faction-image', className, size);
    return <Image className={classString} fluid src={Constants.FactionsImagePaths[faction]} />;
};

export default FactionImage;
