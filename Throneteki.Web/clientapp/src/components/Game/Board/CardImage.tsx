import React from 'react';
import { GameCard } from '../../../types/game';
import { CardOrientation, CardSize } from '../../../types/enums';
import classNames from 'classnames';
import { Image } from 'react-bootstrap';

interface CardImageProps {
    card: GameCard;
    orientation?: CardOrientation;
    halfSize?: boolean;
    size?: CardSize;
}

const CardImage = ({ card, halfSize, orientation, size }: CardImageProps) => {
    const zoomClass = classNames('card-large', {
        vertical: orientation === CardOrientation.Vertical,
        horizontal: orientation === CardOrientation.Horizontal
    });

    return (
        <div className={zoomClass}>
            <div>
                {/* <span className='card-name'>{this.props.cardName}</span> */}
                <Image fluid src={`/img/cards/${card.code}.png`} />
                {/* {this.props.card && <AltCard card={this.props.card} />} */}
            </div>
        </div>
    );
};

export default CardImage;
