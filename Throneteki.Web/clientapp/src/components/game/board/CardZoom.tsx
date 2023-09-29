import { CardMouseOverEventArgs } from '../../../types/game';

interface CardZoomProps {
    card: CardMouseOverEventArgs;
}

const CardZoom = ({ card }: CardZoomProps) => {
    return (
        <div
            className={`card-zoom pointer-events-none absolute right-1 top-11 ${card.size} vertical shadow`}
        >
            {card.image}
        </div>
    );
};

CardZoom.displayName = 'CardZoom';

export default CardZoom;
