import { useTranslation } from 'react-i18next';
import Droppable from './Droppable';
import SquishableCardPanel from './SquishableCardPanel';
import { CardLocation, CardSize } from '../../../types/enums';
import { CardMouseOverEventArgs, GameCard } from '../../../types/game';

interface PlayerRowProps {
    cardSize: CardSize;
    hand: GameCard[];
    isMe: boolean;
    manualMode: boolean;
    onCardClick: (card: GameCard) => void;
    onDragDrop?: (card: string, source: CardLocation, target: CardLocation) => void;
    onMouseOut: (card: GameCard) => void;
    onMouseOver: (args: CardMouseOverEventArgs) => void;
    shadows: GameCard[];
}

const PlayerRow = ({
    cardSize,
    hand,
    isMe,
    manualMode,
    onCardClick,
    onDragDrop,
    onMouseOut,
    onMouseOver,
    shadows
}: PlayerRowProps) => {
    const { t } = useTranslation();

    const handToRender = (
        <SquishableCardPanel
            cards={hand}
            className='panel hand'
            groupVisibleCards
            manualMode={manualMode}
            maxCards={5}
            onCardClick={onCardClick}
            onMouseOut={onMouseOut}
            onMouseOver={onMouseOver}
            source={CardLocation.Hand}
            title={t('Hand')}
            cardSize={cardSize}
        />
    );

    const shadowsToRender = shadows && shadows.length > 0 && (
        <SquishableCardPanel
            cards={shadows}
            className='panel shadows'
            groupVisibleCards
            manualMode={manualMode}
            maxCards={5}
            onCardClick={onCardClick}
            onMouseOut={onMouseOut}
            onMouseOver={onMouseOver}
            source={CardLocation.Shadows}
            title={t('Shadows')}
            cardSize={cardSize}
        />
    );

    return isMe ? (
        <div className='flex pt-1'>
            <Droppable
                className='flex flex-1 flex-col items-center justify-between'
                onDragDrop={onDragDrop}
                source={CardLocation.Hand}
                manualMode={manualMode}
            >
                {handToRender}
            </Droppable>
            <Droppable
                onDragDrop={onDragDrop}
                source={CardLocation.Shadows}
                manualMode={manualMode}
            >
                {shadowsToRender}
            </Droppable>
        </div>
    ) : null;
};

export default PlayerRow;
