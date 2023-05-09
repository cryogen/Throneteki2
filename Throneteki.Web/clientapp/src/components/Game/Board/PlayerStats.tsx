import React from 'react';
import { ThronetekiUser } from '../../../types/user';
import Avatar from '../../Site/Avatar';
import { useTranslation } from 'react-i18next';

import Minus from '../../../assets/img/Minus.png';
import Plus from '../../../assets/img/Plus.png';
import { CardPiles, GamePlayerStats, StatsIndexer } from '../../../types/game';
import Droppable from './Droppable';
import CardPileLink from './CardPileLink';
import DrawDeck from './DrawDeck';

interface PlayerStatsProps {
    activePlayer: boolean;
    cardPiles: CardPiles;
    deck: any;
    firstPlayer: boolean;
    isMe: boolean;
    manualMode?: boolean;
    numDeckCards: number;
    onCardClick: any;
    onDragDrop: any;
    onDrawPopupChange: any;
    onMenuItemClick: any;
    onMouseOut: any;
    onMouseOver: any;
    onPopupChange?: any;
    onShuffleClick: any;
    onTouchMove?: any;
    showControls: boolean;
    side: string;
    size: string;
    spectating: boolean;
    stats: GamePlayerStats;
    user: ThronetekiUser;
}

const PlayerStats = ({
    activePlayer,
    cardPiles,
    deck,
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
    onTouchMove,
    showControls,
    side,
    size,
    spectating,
    stats,
    user
}: PlayerStatsProps) => {
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
                            // dispatch(sendGameMessage('changeStat', statToSet, -1));
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
                            //    dispatch(sendGameMessage('changeStat', statToSet, 1));
                        }}
                    >
                        <img src={Plus} title='+' alt='+' />
                    </a>
                ) : null}
            </div>
        );
    };

    const { t } = useTranslation();

    const playerAvatar = (
        <div className={`pr-1 player-info ${activePlayer ? 'active-player' : 'inactive-player'}`}>
            <Avatar avatar={user?.picture} />
            <b>{user?.name || (t('Noone') as any)}</b>
        </div>
    );

    const pileProps = {
        isMe,
        onMenuItemClick,
        onPopupChange,
        onTouchMove,
        manualMode,
        onCardClick,
        onDragDrop,
        onMouseOut,
        onMouseOver,
        popupLocation: side,
        size
    };

    const renderDroppableList = (source: any, child: any) => {
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
            source='hand'
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
            source='discard'
        />
    );

    const dead = (
        <CardPileLink
            {...pileProps}
            cards={cardPiles.deadPile}
            className='dead'
            title={t('Dead')}
            source='dead'
        />
    );

    const plots = (
        <CardPileLink
            {...pileProps}
            cards={cardPiles.deadPile}
            className='plots'
            title={t('Plots')}
            source='plots'
        />
    );

    const usedPlots = (
        <CardPileLink
            {...pileProps}
            cards={cardPiles.deadPile}
            className='used-plots'
            title={t('Used Plots')}
            source='usedPlots'
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

                {!isMe && <div className='state'>{renderDroppableList('hand', hand)}</div>}
                <div className='state'>{renderDroppableList('draw', draw)}</div>
                <div className='state'>{renderDroppableList('discard', discard)}</div>
                <div className='state'>{renderDroppableList('dead', dead)}</div>
                <div className='state'>{renderDroppableList('plots', plots)}</div>
                <div className='state'>{renderDroppableList('usedPlots', usedPlots)}</div>
            </div>
        </div>
    );
};

export default PlayerStats;