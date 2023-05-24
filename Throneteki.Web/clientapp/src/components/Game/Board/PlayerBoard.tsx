import React from 'react';
import classNames from 'classnames';
import Droppable from './Droppable';
import Card from './Card';
import PlayerRow from './PlayerRow';
import { CardLocation, CardSize } from '../../../types/enums';
import { CardMenuItem, CardMouseOverEventArgs, GameCard } from '../../../types/game';

interface PlayerBoardProps {
    cardsInPlay: GameCard[];
    cardSize?: CardSize;
    hand?: GameCard[];
    isMe?: boolean;
    isSpectating: boolean;
    manualMode?: boolean;
    onCardClick: (card: GameCard) => void;
    onDragDrop?: (card: GameCard) => void;
    onMenuItemClick?: (card: GameCard, menuItem: CardMenuItem) => void;
    onMouseOut: (card: GameCard) => void;
    onMouseOver: (args: CardMouseOverEventArgs) => void;
    rowDirection: string;
    user: any;
}

interface GameCardRow {
    cards: GameCard[];
    name: string;
}

const PlayerBoard = ({
    cardsInPlay,
    cardSize,
    hand,
    isMe = false,
    isSpectating,
    manualMode = false,
    onCardClick,
    onDragDrop,
    onMenuItemClick,
    onMouseOut,
    onMouseOver,
    rowDirection,
    user
}: PlayerBoardProps) => {
    const getCardRows = () => {
        const groupedCards = cardsInPlay.reduce((group: { [key: string]: GameCard[] }, card) => {
            (group[card.type] = group[card.type] || []).push(card);

            return group;
        }, {});

        const rows = [];
        const locations = groupedCards['location'] || [];
        const characters = groupedCards['character'] || [];
        let other: GameCard[] = [];

        for (const key of Object.keys(groupedCards).filter(
            (k) => !['location', 'character'].includes(k)
        )) {
            other = other.concat(groupedCards[key]);
        }

        if (rowDirection === 'reverse') {
            if (other.length > 0) {
                rows.push({ name: 'other', cards: other });
            }

            rows.push({ name: 'locations', cards: locations });
            rows.push({ name: 'characters', cards: characters });
        } else {
            rows.push({ name: 'characters', cards: characters });
            rows.push({ name: 'locations', cards: locations });
            if (other.length > 0) {
                rows.push({ name: 'other', cards: other });
            }
        }

        return rows;
    };

    const renderRows = (rows: GameCardRow[]) => {
        return rows.map((row, index: number) => (
            <div className={`card-row ${row.name}`} key={`card-row-${index}`}>
                {renderRow(row.cards)}
            </div>
        ));
    };

    const renderRow = (row: GameCard[]) => {
        return row.map((card: GameCard) => (
            <Card
                key={card.uuid}
                canDrag={manualMode}
                card={card}
                disableMouseOver={card.facedown && !card.code}
                halfSize={/*user.settings.optionSettings.useHalfSizedCards*/ false}
                isSpectating={isSpectating}
                onClick={onCardClick}
                onMenuItemClick={onMenuItemClick}
                onMouseOut={onMouseOut}
                onMouseOver={onMouseOver}
                size={cardSize}
                source={CardLocation.PlayArea}
            />
        ));
    };

    const rows = getCardRows();

    const className = classNames('player-board', {
        'our-side': rowDirection === 'default',
        player: isMe
    });

    return (
        <div className={className}>
            <Droppable onDragDrop={onDragDrop} source='play area' manualMode={manualMode}>
                {renderRows(rows)}
            </Droppable>
            {isMe && (
                <PlayerRow
                    cardSize={cardSize}
                    hand={hand}
                    isMe={isMe}
                    manualMode={manualMode}
                    onCardClick={onCardClick}
                    onDragDrop={onDragDrop}
                    onMouseOut={onMouseOut}
                    onMouseOver={onMouseOver}
                />
            )}
        </div>
    );
};

export default PlayerBoard;
