import React, { ReactNode } from 'react';
import { useDrop } from 'react-dnd';
import classNames from 'classnames';
import { ItemTypes } from '../../../constants';
import { CardLocation } from '../../../types/enums';

const validTargets: { [key: string]: CardLocation[] } = {
    [CardLocation.Hand]: [
        CardLocation.PlayArea,
        CardLocation.Discard,
        CardLocation.Draw,
        CardLocation.Dead,
        CardLocation.OutOfGame,
        CardLocation.Conclave,
        CardLocation.Shadows
    ],
    [CardLocation.PlayArea]: [
        CardLocation.Discard,
        CardLocation.Hand,
        CardLocation.Draw,
        CardLocation.Dead,
        CardLocation.OutOfGame,
        CardLocation.Conclave,
        CardLocation.Shadows
    ],
    [CardLocation.Discard]: [
        CardLocation.Dead,
        CardLocation.Hand,
        CardLocation.Draw,
        CardLocation.PlayArea,
        CardLocation.OutOfGame,
        CardLocation.Conclave,
        CardLocation.Shadows
    ],
    [CardLocation.Dead]: [
        CardLocation.Hand,
        CardLocation.Draw,
        CardLocation.Discard,
        CardLocation.PlayArea,
        CardLocation.OutOfGame,
        CardLocation.Conclave,
        CardLocation.Shadows
    ],
    [CardLocation.Draw]: [
        CardLocation.Hand,
        CardLocation.Discard,
        CardLocation.Dead,
        CardLocation.PlayArea,
        CardLocation.OutOfGame,
        CardLocation.Conclave,
        CardLocation.Rookery,
        CardLocation.Shadows
    ],
    [CardLocation.Plots]: [
        CardLocation.RevealedPlots,
        CardLocation.OutOfGame,
        CardLocation.Rookery
    ],
    [CardLocation.RevealedPlots]: [CardLocation.Plots, CardLocation.OutOfGame],
    [CardLocation.OutOfGame]: [
        CardLocation.Plots,
        CardLocation.RevealedPlots,
        CardLocation.Draw,
        CardLocation.PlayArea,
        CardLocation.Discard,
        CardLocation.Hand,
        CardLocation.Dead,
        CardLocation.Shadows
    ],
    [CardLocation.Conclave]: [
        CardLocation.Hand,
        CardLocation.PlayArea,
        CardLocation.Draw,
        CardLocation.Discard,
        CardLocation.Dead,
        CardLocation.OutOfGame,
        CardLocation.Shadows
    ],
    [CardLocation.Shadows]: [
        CardLocation.Dead,
        CardLocation.Discard,
        CardLocation.Draw,
        CardLocation.Hand,
        CardLocation.OutOfGame,
        CardLocation.PlayArea
    ],
    [CardLocation.FullDeck]: [CardLocation.Rookery],
    [CardLocation.Rookery]: [CardLocation.FullDeck]
};

interface DroppableProps {
    children?: ReactNode | ReactNode[];
    manualMode: boolean;
    onDragDrop: (card: string, source: CardLocation, target: CardLocation) => void;
    source: CardLocation;
}

interface DraggingCard {
    canPlay: boolean;
    card: string;
    source: CardLocation;
}

const Droppable = ({ children, manualMode, onDragDrop, source }: DroppableProps) => {
    const [{ canDrop, isOver, itemSource }, drop] = useDrop({
        accept: ItemTypes.CARD,
        canDrop: (_, monitor) => {
            const item = monitor.getItem<DraggingCard>();

            if (manualMode) {
                return (
                    validTargets[item.source] &&
                    validTargets[item.source].some((target) => target === source)
                );
            }

            if (
                (item.source === CardLocation.Hand && source === CardLocation.PlayArea) ||
                (item.source === CardLocation.Hand && source === CardLocation.Discard)
            ) {
                return item.canPlay;
            }

            return false;
        },
        collect: (monitor) => {
            const item = monitor.getItem<DraggingCard>();

            return {
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
                itemSource: item && item.source
            };
        },
        drop: (_, monitor) => {
            const item = monitor.getItem<DraggingCard>();

            onDragDrop && onDragDrop(item.card, item.source, source);
        }
    });
    const className = classNames('overlay', {
        'drop-ok': isOver && canDrop,
        'no-drop': isOver && !canDrop && source !== itemSource,
        'can-drop': !isOver && canDrop,
        [source]: true
    });

    const dropClass = classNames('drop-target', {
        [source]: source !== 'play area'
    });

    return (
        <div className={dropClass} ref={drop}>
            <div className={className} />
            {children}
        </div>
    );
};

export default Droppable;
