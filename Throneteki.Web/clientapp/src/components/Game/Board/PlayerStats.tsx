import React from 'react';
import { useTranslation } from 'react-i18next';

import Avatar from '../../Site/Avatar';
import Droppable from './Droppable';
import CardPileLink from './CardPileLink';
import DrawDeck from './DrawDeck';
import { BoardSide, CardLocation, CardOrientation, CardSize } from '../../../types/enums';
import {
    CardMenuItem,
    CardMouseOverEventArgs,
    CardPiles,
    GameCard,
    GamePlayerStats,
    PopupChangeEventArgs,
    StatsIndexer
} from '../../../types/game';

import Minus from '../../../assets/img/Minus.png';
import Plus from '../../../assets/img/Plus.png';
import { useAppDispatch } from '../../../redux/hooks';
import { gameNodeActions } from '../../../redux/slices/gameNodeSlice';

interface PlayerStatsProps {
    activePlayer: boolean;
    cardPiles: CardPiles;
    firstPlayer: boolean;
    isMe: boolean;
    manualMode?: boolean;
    numDeckCards: number;
    onCardClick: (card: GameCard) => void;
    onDragDrop?: (card: GameCard, source: CardLocation, target: CardLocation) => void;
    onDrawPopupChange: (args: PopupChangeEventArgs) => void;
    onMenuItemClick: (card: GameCard, menuItem: CardMenuItem) => void;
    onMouseOut: (card: GameCard) => void;
    onMouseOver: (args: CardMouseOverEventArgs) => void;
    onPopupChange?: (args: PopupChangeEventArgs) => void;
    onShuffleClick: () => void;
    showControls: boolean;
    side: BoardSide;
    size: CardSize;
    spectating: boolean;
    stats: GamePlayerStats;
    user: any;
}

const PlayerStats = ({
    activePlayer,
    cardPiles,
    isMe,
    manualMode = false,
    numDeckCards,
    onCardClick,
    onDragDrop,
    onDrawPopupChange,
    onMenuItemClick,
    onMouseOut,
    onMouseOver,
    onPopupChange,
    onShuffleClick,
    showControls,
    side,
    size,
    spectating,
    stats,
    user
}: PlayerStatsProps) => {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const getStatValueOrDefault = (stat: StatsIndexer) => {
        if (!stats) {
            return 0;
        }

        return stats[stat] || 0;
    };

    const getButton = (stat: StatsIndexer, name: string, statToSet: string = stat) => {
        return (
            <div className='state' title={t(name)}>
                {showControls ? (
                    <a
                        href='#'
                        className='btn-stat'
                        onClick={() => {
                            dispatch(
                                gameNodeActions.sendChangeStatMessage({
                                    statToChange: statToSet,
                                    amount: -1
                                })
                            );
                        }}
                    >
                        <img src={Minus} title='-' alt='-' />
                    </a>
                ) : null}
                <div className='stat-value'>{getStatValueOrDefault(stat)}</div>
                <div className={`stat-image ${stat}`} />
                {showControls ? (
                    <a
                        href='#'
                        className='btn-stat'
                        onClick={() => {
                            dispatch(
                                gameNodeActions.sendChangeStatMessage({
                                    statToChange: statToSet,
                                    amount: 1
                                })
                            );
                        }}
                    >
                        <img src={Plus} title='+' alt='+' />
                    </a>
                ) : null}
            </div>
        );
    };

    const playerAvatar = (
        <div className={`pr-1 player-info ${activePlayer ? 'active-player' : 'inactive-player'}`}>
            <Avatar avatar={user?.avatar} />
            <b>{user?.username || (t('Noone') as any)}</b>
        </div>
    );

    const pileProps = {
        isMe,
        onMenuItemClick,
        onPopupChange,
        manualMode,
        onCardClick,
        onDragDrop,
        onMouseOut,
        onMouseOver,
        popupLocation: side,
        size
    };

    const renderDroppableList = (source: CardLocation, child: JSX.Element) => {
        return isMe ? (
            <Droppable onDragDrop={onDragDrop} source={source} manualMode={manualMode}>
                {child}
            </Droppable>
        ) : (
            child
        );
    };

    const hand = (
        <CardPileLink
            {...pileProps}
            cards={cardPiles.hand}
            className='hand'
            title={t('Hand')}
            source={CardLocation.Hand}
        />
    );

    const draw = (
        <DrawDeck
            {...pileProps}
            cardCount={numDeckCards}
            cards={cardPiles.drawDeck}
            isMe={isMe}
            numDeckCards={numDeckCards}
            onPopupChange={onDrawPopupChange}
            onShuffleClick={onShuffleClick}
            spectating={spectating}
        />
    );

    const discard = (
        <CardPileLink
            {...pileProps}
            cards={cardPiles.discardPile}
            className='discard'
            title={t('Discard')}
            source={CardLocation.Discard}
        />
    );

    const dead = (
        <CardPileLink
            {...pileProps}
            cards={cardPiles.deadPile}
            className='dead'
            title={t('Dead')}
            source={CardLocation.Dead}
        />
    );

    const plots = (
        <CardPileLink
            {...pileProps}
            cards={cardPiles.plotDeck}
            className='plots'
            title={t('Plots')}
            source={CardLocation.Plots}
            orientation={CardOrientation.Horizontal}
        />
    );

    const usedPlots = (
        <CardPileLink
            {...pileProps}
            cards={cardPiles.plotDiscard}
            className='used-plots'
            title={t('Used Plots')}
            source={CardLocation.RevealedPlots}
            orientation={CardOrientation.Horizontal}
        />
    );

    return (
        <div className='panel player-stats d-flex justify-content-between align-items-center'>
            <div className='state'>
                {playerAvatar}
                {getButton('gold', 'Gold')}
                {getButton('totalPower', 'Power', 'power')}
                {getButton('initiative', 'Initiative')}
                {getButton('claim', 'Claim')}
                {getButton('reserve', 'Reserve')}

                {!isMe && (
                    <div className='state'>{renderDroppableList(CardLocation.Hand, hand)}</div>
                )}
                <div className='state'>{renderDroppableList(CardLocation.Draw, draw)}</div>
                <div className='state'>{renderDroppableList(CardLocation.Discard, discard)}</div>
                <div className='state'>{renderDroppableList(CardLocation.Dead, dead)}</div>
                <div className='state'>{renderDroppableList(CardLocation.Plots, plots)}</div>
                <div className='state'>
                    {renderDroppableList(CardLocation.RevealedPlots, usedPlots)}
                </div>
            </div>
        </div>
    );
};

export default PlayerStats;
