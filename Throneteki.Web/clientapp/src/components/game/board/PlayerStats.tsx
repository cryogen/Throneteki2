import { MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import { toastr } from 'react-redux-toastr';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faComment, faCopy, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

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

import { Faction } from '../../../types/data';
import CardImage from '../../images/CardImage';
import { Constants } from '../../../constants';
import ZoomCardImage from './ZoomCardImage';
import { Avatar, Badge } from '@nextui-org/react';
import StatContainer from './StatContainer';
import StatDisplay from './StatDisplay';

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
            <StatContainer title={t(name)}>
                <StatDisplay
                    showControls={showControls}
                    statName={name}
                    statCode={stat}
                    statValue={getStatValueOrDefault(stat)}
                    onMinusClick={
                        showControls
                            ? () =>
                                  dispatch(
                                      gameNodeActions.sendChangeStatMessage({
                                          statToChange: statToSet,
                                          amount: -1
                                      })
                                  )
                            : null
                    }
                    onPlusClick={
                        showControls
                            ? () =>
                                  dispatch(
                                      gameNodeActions.sendChangeStatMessage({
                                          statToChange: statToSet,
                                          amount: 1
                                      })
                                  )
                            : null
                    }
                />
            </StatContainer>
        );
    };

    const playerAvatar = (
        <div
            className={`pr-1 ${
                activePlayer ? 'active-player' : 'inactive-player'
            } flex items-center`}
        >
            <Avatar src={user?.avatar} showFallback size='sm' />

            <span className='pl-2 font-bold'>
                {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    user?.username || (t('Noone') as any)
                }
            </span>
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
            <Droppable
                className='flex items-center'
                onDragDrop={onDragDrop}
                source={source}
                manualMode={manualMode}
            >
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
            className='flex items-center'
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
            <StatContainer>
                <div
                    className='h-8 w-6'
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
            </StatContainer>
            {agenda && (
                <StatContainer>
                    <div
                        className='h-8 w-6'
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
                </StatContainer>
            )}
            {cardPiles.bannerCards.length > 0 && (
                <StatContainer>
                    <CardPileLink
                        {...pileProps}
                        hiddenTopCard={true}
                        cards={cardPiles.bannerCards}
                        className='agenda'
                        title={t('Banners')}
                        source={CardLocation.Banners}
                    />
                </StatContainer>
            )}
        </>
    );

    return (
        <div className='player-stats flex content-between items-center bg-background'>
            <StatContainer>
                {playerAvatar}
                {getButton('gold', 'Gold')}
                {getButton('totalPower', 'Power', 'power')}
                {getButton('initiative', 'Initiative')}
                {getButton('claim', 'Claim')}
                {getButton('reserve', 'Reserve')}
                {factionAndAgenda}
                {!isMe && (
                    <StatContainer>{renderDroppableList(CardLocation.Hand, hand)}</StatContainer>
                )}
                {!isMe && cardPiles.shadows.length > 0 && (
                    <StatContainer>
                        {renderDroppableList(CardLocation.Shadows, shadows)}
                    </StatContainer>
                )}
                <StatContainer>{renderDroppableList(CardLocation.Draw, draw)}</StatContainer>
                <StatContainer>{renderDroppableList(CardLocation.Discard, discard)}</StatContainer>
                <StatContainer>{renderDroppableList(CardLocation.Dead, dead)}</StatContainer>
                <StatContainer>{renderDroppableList(CardLocation.Plots, plots)}</StatContainer>
                <StatContainer>
                    {renderDroppableList(CardLocation.RevealedPlots, usedPlots)}
                </StatContainer>
            </StatContainer>

            {showMessages && (
                <StatContainer>
                    <StatContainer>
                        <a href='#' className='pl-1 pr-1'>
                            <FontAwesomeIcon
                                icon={muteSpectators ? faEyeSlash : faEye}
                                onClick={onMuteClick}
                            ></FontAwesomeIcon>
                        </a>
                    </StatContainer>
                    <StatContainer>
                        <a href='#' className='pl-1 pr-1'>
                            <FontAwesomeIcon
                                icon={faCopy}
                                onClick={writeChatToClipboard}
                            ></FontAwesomeIcon>
                        </a>
                    </StatContainer>
                    <StatContainer>
                        <a href='#' onClick={onSettingsClick} className='pl-1 pr-1'>
                            <FontAwesomeIcon icon={faCogs}></FontAwesomeIcon>
                            <span className='ml-1'>{t('Settings')}</span>
                        </a>
                    </StatContainer>
                    <StatContainer>
                        <a href='#' onClick={onMessagesClick} className='pl-1'>
                            <FontAwesomeIcon icon={faComment}></FontAwesomeIcon>
                            {numMessages > 0 && <Badge color='danger'>{numMessages}</Badge>}
                        </a>
                    </StatContainer>
                </StatContainer>
            )}
        </div>
    );
};

export default PlayerStats;
