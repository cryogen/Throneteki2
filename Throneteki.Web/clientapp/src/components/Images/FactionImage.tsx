import React from 'react';
import { Image } from 'react-bootstrap';
import { Constants } from '../../constants';

interface FactionImageProps {
    faction: string;
}

const FactionImage = ({ faction }: FactionImageProps) => {
    return <Image className='faction-image' fluid src={Constants.FactionsImagePaths[faction]} />;
};

export default FactionImage;
