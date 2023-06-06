import React from 'react';
import { CardOrientation, CardSize } from '../../../types/enums';
import classNames from 'classnames';
import { Image } from 'react-bootstrap';

interface CardImageProps {
    imageUrl: string;
    orientation?: CardOrientation;
    halfSize?: boolean;
    size?: CardSize;
}

const ZoomCardImage = ({ imageUrl, orientation }: CardImageProps) => {
    const zoomClass = classNames('card-large', {
        vertical: orientation === CardOrientation.Vertical,
        horizontal: orientation === CardOrientation.Horizontal
    });

    return (
        <div className={zoomClass}>
            <div>
                {/* <span className='card-name'>{this.props.cardName}</span> */}
                <Image fluid src={imageUrl} />
                {/* {this.props.card && <AltCard card={this.props.card} />} */}
            </div>
        </div>
    );
};

export default ZoomCardImage;
