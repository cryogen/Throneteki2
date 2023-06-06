import React, { MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import { toastr } from 'react-redux-toastr';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faComment, faCopy, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Badge } from 'react-bootstrap';

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
import { useAppDispatch } from '../../../redux/hooks';
import { gameNodeActions } from '../../../redux/slices/gameNodeSlice';

import Minus from '../../../assets/img/Minus.png';
import Plus from '../../../assets/img/Plus.png';
import { Faction } from '../../../types/data';
import CardImage from '../../Images/CardImage';
import { Constants } from '../../../constants';
import ZoomCardImage from './ZoomCardImage';

interface PlayerStatsProps {
    activePlayer: boolean;
    agenda?: GameCard;
    cardPiles: CardPiles;
    faction: Faction;
    firstPlayer: boolean;
    isMe: boolean;
    manualMode?: boolean;
    muteSpectators?: boolean;
    numDeckCards: number;
    numMessages?: number;
    onCardClick: (card: GameCard) => void;
    onDragDrop?: (card: string, source: CardLocation, target: CardLocation) => void;
    onToggleVisibilityClick: (visible: boolean) => void;
    onMenuItemClick: (card: GameCard, menuItem: CardMenuItem) => void;
    onMessagesClick?: () => void;
    onMouseOut: () => void;
    onMouseOver: (args: CardMouseOverEventArgs) => void;
    onMuteClick?: MouseEventHandler;
    onPopupChange?: (args: PopupChangeEventArgs) => void;
    onSettingsClick?: MouseEventHandler;
    onShuffleClick: () => void;
    showControls: boolean;
    showDeck?: boolean;
    showMessages?: boolean;
    side: BoardSide;
    size: CardSize;
    spectating: boolean;
    stats: GamePlayerStats;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any;
}

const PlayerStats = ({
    activePlayer,
    agenda,
    cardPiles,
    faction,
    isMe,
    manualMode = false,
    muteSpectators = false,
    numDeckCards,
    numMessages = 0,
    onCardClick,
    onDragDrop,
    onToggleVisibilityClick,
    onMenuItemClick,
    onMessagesClick,
    onMouseOut,
    onMouseOver,
    onMuteClick,
    onPopupChange,
    onSettingsClick,
    onShuffleClick,
    showControls,
    showDeck = false,
    showMessages = false,
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

            <b>
                {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    user?.username || (t('Noone') as any)
                }
            </b>
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

    const writeChatToClipboard = (event: React.MouseEvent<SVGSVGElement>) => {
        event.preventDefault();
        const messagePanel = document.getElementsByClassName('messages panel')[0] as HTMLDivElement;
        if (messagePanel) {
            navigator.clipboard
                .writeText(messagePanel.innerText)
                .then(() => toastr.success('Copied game chat to clipboard', null))
                .catch((err) => toastr.error(`Could not copy game chat: ${err}`, null));
        }
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

    const shadows = (
        <CardPileLink
            {...pileProps}
            cards={cardPiles.shadows}
            className='shadows'
            title={t('Shadows')}
            source={CardLocation.Shadows}
        />
    );

    const draw = (
        <DrawDeck
            {...pileProps}
            cardCount={numDeckCards}
            cards={cardPiles.drawDeck}
            isMe={isMe}
            numDeckCards={numDeckCards}
            onToggleVisibilityClick={onToggleVisibilityClick}
            onShuffleClick={onShuffleClick}
            showDeck={showDeck}
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

    const factionAndAgenda = (
        <>
            <div className='state'>
                <div
                    className='icon'
                    onMouseOver={() =>
                        onMouseOver({
                            image: (
                                <ZoomCardImage
                                    imageUrl={Constants.FactionsImagePaths[faction.code]}
                                />
                            ),
                            size: 'normal'
                        })
                    }
                    onMouseOut={() => onMouseOut()}
                >
                    <CardImage imageUrl={Constants.FactionsImagePaths[faction.code]} size={'sm'} />
                </div>
            </div>
            {agenda && (
                <div className='state'>
                    <div
                        className='icon'
                        onMouseOver={() =>
                            onMouseOver({
                                image: <ZoomCardImage imageUrl={`/img/cards/${agenda.code}.png`} />,
                                size: 'normal'
                            })
                        }
                        onMouseOut={() => onMouseOut()}
                    >
                        <CardImage imageUrl={`/img/cards/${agenda.code}.png`} size={'sm'} />
                    </div>
                </div>
            )}
            {cardPiles.bannerCards.length > 0 && (
                <div className='state'>
                    <CardPileLink
                        {...pileProps}
                        hiddenTopCard={true}
                        cards={cardPiles.bannerCards}
                        className='banners'
                        title={t('Banners')}
                        source={CardLocation.Banners}
                    />
                </div>
            )}
        </>
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
                {factionAndAgenda}
                {!isMe && (
                    <div className='state'>{renderDroppableList(CardLocation.Hand, hand)}</div>
                )}
                {!isMe && cardPiles.shadows.length > 0 && (
                    <div className='state'>
                        {renderDroppableList(CardLocation.Shadows, shadows)}
                    </div>
                )}
                <div className='state'>{renderDroppableList(CardLocation.Draw, draw)}</div>
                <div className='state'>{renderDroppableList(CardLocation.Discard, discard)}</div>
                <div className='state'>{renderDroppableList(CardLocation.Dead, dead)}</div>
                <div className='state'>{renderDroppableList(CardLocation.Plots, plots)}</div>
                <div className='state'>
                    {renderDroppableList(CardLocation.RevealedPlots, usedPlots)}
                </div>
            </div>

            {showMessages && (
                <div className='state'>
                    <div className='state'>
                        <a href='#' className='pr-1 pl-1'>
                            <FontAwesomeIcon
                                icon={muteSpectators ? faEyeSlash : faEye}
                                onClick={onMuteClick}
                            ></FontAwesomeIcon>
                        </a>
                    </div>
                    <div className='state'>
                        <a href='#' className='pr-1 pl-1'>
                            <FontAwesomeIcon
                                icon={faCopy}
                                onClick={writeChatToClipboard}
                            ></FontAwesomeIcon>
                        </a>
                    </div>
                    <div className='state'>
                        <a href='#' onClick={onSettingsClick} className='pr-1 pl-1'>
                            <FontAwesomeIcon icon={faCogs}></FontAwesomeIcon>
                            <span className='ml-1'>{t('Settings')}</span>
                        </a>
                    </div>
                    <div className='state'>
                        <a href='#' onClick={onMessagesClick} className='pl-1'>
                            <FontAwesomeIcon icon={faComment}></FontAwesomeIcon>
                            {numMessages > 0 && <Badge bg='danger'>{numMessages}</Badge>}
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerStats;
