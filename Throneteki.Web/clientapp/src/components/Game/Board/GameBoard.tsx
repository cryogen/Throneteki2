import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { Trans } from 'react-i18next';
import { ThronetekiUser } from '../../../types/user';
import { useAuth } from 'react-oidc-context';
import { CardMenuItem, CardMouseOverEventArgs, GameCard, GamePlayer } from '../../../types/game';
import classNames from 'classnames';
import PlayerStats from './PlayerStats';
import PlayerBoard from './PlayerBoard';
import { useGetCardsQuery } from '../../../redux/api/apiSlice';
import ActivePlayerPrompt from './ActivePlayerPrompt';
import GameChat from './GameChat';
import { gameNodeActions } from '../../../redux/slices/gameNodeSlice';
import LoadingSpinner from '../../LoadingSpinner';
import { BoardSide, CardLocation } from '../../../types/enums';
import CardZoom from './CardZoom';
import GameConfigurationModal from './GameConfigurationModal';

const placeholderPlayer: GamePlayer = {
    activePlayer: false,
    activePlot: null,
    agenda: null,
    cardPiles: {
        bannerCards: [],
        cardsInPlay: [],
        conclavePile: [],
        deadPile: [],
        discardPile: [],
        drawDeck: [],
        hand: [],
        outOfGamePile: [],
        plotDeck: [],
        plotDiscard: [],
        shadows: []
    },
    deckData: {},
    faction: {},
    firstPlayer: false,
    name: 'Placeholder',
    numDrawCards: 0,
    numDeckCards: 0,
    plotSelected: false,
    showDeck: false,
    stats: {
        claim: 0,
        gold: 0,
        reserve: 0,
        initiative: 0,
        totalPower: 0
    },
    title: null,
    user: null,
    controls: [],
    menuTitle: undefined,
    promptTitle: undefined,
    phase: undefined,
    buttons: []
};

const defaultPlayerInfo = (source?: GamePlayer) => {
    const player = Object.assign({}, placeholderPlayer, source);
    player.cardPiles = Object.assign({}, placeholderPlayer.cardPiles, player.cardPiles);
    return player;
};

const GameBoard = () => {
    const auth = useAuth();
    const { currentGame: activeGame } = useAppSelector((state) => state.gameNode);
    const user = auth.user?.profile as ThronetekiUser;
    const { isLoading, data: cards } = useGetCardsQuery({});
    const [showMessages, setShowMessages] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newMessages, setNewMessages] = useState(0);
    const [lastMessageCount, setLastMessageCount] = useState(0);
    const [cardToZoom, setCardToZoom] = useState<CardMouseOverEventArgs | null>(null);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const currentMessageCount = activeGame?.messages.length || 0;

        if (showMessages) {
            setLastMessageCount(currentMessageCount);
            setNewMessages(0);
        } else {
            setNewMessages(currentMessageCount - lastMessageCount);
        }
    }, [activeGame?.messages.length, lastMessageCount, showMessages]);

    const renderBoard = (thisPlayer: GamePlayer, otherPlayer: GamePlayer) => {
        return (
            <div className='board-middle d-flex flex-column flex-grow-1 flex-shrink-1'>
                <div className='board-inner flex-grow-1 flex-shrink-1 d-flex'>
                    <div className='play-area'>
                        {
                            <>
                                <PlayerBoard
                                    cardsInPlay={otherPlayer.cardPiles.cardsInPlay}
                                    isSpectating={isSpectating()}
                                    onCardClick={onCardClick}
                                    onMenuItemClick={onMenuItemClick}
                                    onMouseOut={onMouseOut}
                                    onMouseOver={onMouseOver}
                                    rowDirection='reverse'
                                    user={user}
                                />
                                <PlayerBoard
                                    cardsInPlay={thisPlayer.cardPiles.cardsInPlay}
                                    cardSize={settings.cardSize}
                                    hand={thisPlayer.cardPiles.hand}
                                    isMe={!isSpectating()}
                                    isSpectating={isSpectating()}
                                    manualMode={true}
                                    onCardClick={onCardClick}
                                    onDragDrop={onDragDrop}
                                    onMenuItemClick={onMenuItemClick}
                                    onMouseOut={onMouseOut}
                                    onMouseOver={onMouseOver}
                                    rowDirection='default'
                                    shadows={thisPlayer.cardPiles.shadows}
                                    user={user}
                                />
                            </>
                        }
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return <LoadingSpinner text='Please wait while the card data is loaded' />;
    }

    if (!activeGame) {
        return (
            <div>
                <Trans>There has been a problem with the connection to the game server</Trans>
            </div>
        );
    }

    if (!user?.name) {
        return (
            <div>
                <Trans>You are not logged in</Trans>
            </div>
        );
    }

    let thisPlayer = activeGame.players[user.name];

    if (!thisPlayer) {
        return (
            <div>
                <Trans>An error occured during the game</Trans>
            </div>
        );
    }

    let otherPlayer = Object.values(activeGame.players).find((player) => {
        return player.name !== thisPlayer.name;
    });

    thisPlayer = defaultPlayerInfo(thisPlayer);
    otherPlayer = defaultPlayerInfo(otherPlayer);

    const boardClass = classNames('game-board d-flex justify-content-between flex-column', {
        'select-cursor': thisPlayer && thisPlayer.selectCard
    });

    const onCardClick = (card: GameCard) =>
        dispatch(gameNodeActions.sendCardClickedMessage(card.uuid));
    const onDragDrop = (card: string, source: CardLocation, target: CardLocation) => {
        dispatch(
            gameNodeActions.sendCardDroppedMessage({
                uuid: card,
                source: source,
                target: target
            })
        );
    };
    const onToggleDrawDeckVisibleClick = (visible: boolean) => {
        dispatch(gameNodeActions.sendShowDrawDeckMessage(visible));
    };
    const onMenuItemClick = (card: GameCard, menuItem: CardMenuItem) => {
        dispatch(gameNodeActions.sendMenuItemClickMessage({ card: card.uuid, menuItem }));
    };
    const onMouseOut = () => {
        setCardToZoom(null);
    };
    const onMouseOver = (arg: CardMouseOverEventArgs) => {
        if (arg.image) {
            setCardToZoom(arg);
        }
    };
    const onShuffleClick = () => true;
    const onCommand = (command: string, arg: string, method: string, promptId: string) => {
        dispatch(gameNodeActions.sendPromptClickedMessage({ arg, command, method, promptId }));
    };
    const onTitleClick = () => true;
    const sendChatMessage = (message: string) => {
        dispatch(gameNodeActions.sendGameChatMessage(message));
    };
    const onMuteClick = () => {
        dispatch(gameNodeActions.sendToggleMuteSpectatorsMessage());
    };
    const onMessagesClick = () => {
        const showState = !showMessages;

        if (showState) {
            setNewMessages(0);
            setLastMessageCount(activeGame.messages.length);
        }

        setShowMessages(showState);
    };
    const onKeywordSettingToggle = (option: string, value: string | boolean) => {
        dispatch(gameNodeActions.sendToggleKeywordSettingMessage({ option: option, value: value }));
    };
    const onPromptDupesToggle = (value: boolean) => {
        dispatch(gameNodeActions.sendTogglePromptDupesMessage(value));
    };
    const onPromptedActionWindowToggle = (option: string, value: string | boolean) => {
        dispatch(
            gameNodeActions.sendTogglePromptedActionWindowMessage({ option: option, value: value })
        );
    };
    const onTimerSettingToggle = (option: string, value: string | boolean) => {
        dispatch(gameNodeActions.sendToggleTimerSettingMessage({ option: option, value: value }));
    };

    const isSpectating = () => !activeGame.players[user.name as string];

    const settings = JSON.parse(user.throneteki_settings);

    return (
        <div className={boardClass}>
            {showModal && (
                <GameConfigurationModal
                    onClose={() => setShowModal(false)}
                    keywordSettings={thisPlayer.keywordSettings}
                    onKeywordSettingToggle={onKeywordSettingToggle}
                    onPromptDupesToggle={onPromptDupesToggle}
                    onPromptedActionWindowToggle={onPromptedActionWindowToggle}
                    onTimerSettingToggle={onTimerSettingToggle}
                    promptDupes={thisPlayer.promptDupes}
                    promptedActionWindows={thisPlayer.promptedActionWindows}
                    timerSettings={thisPlayer.timerSettings}
                />
            )}
            <div className='stats-top'>
                <PlayerStats
                    agenda={otherPlayer.agenda}
                    faction={otherPlayer.faction}
                    activePlayer={otherPlayer.activePlayer}
                    firstPlayer={otherPlayer.firstPlayer}
                    showControls={false}
                    stats={otherPlayer.stats}
                    user={otherPlayer.user}
                    cardPiles={otherPlayer.cardPiles}
                    isMe={false}
                    numDeckCards={otherPlayer.numDeckCards}
                    onCardClick={onCardClick}
                    onDragDrop={onDragDrop}
                    onToggleVisibilityClick={onToggleDrawDeckVisibleClick}
                    onMenuItemClick={onMenuItemClick}
                    onMouseOut={onMouseOut}
                    onMouseOver={onMouseOver}
                    onShuffleClick={onShuffleClick}
                    side={BoardSide.Top}
                    size={settings.cardSize}
                    spectating={isSpectating()}
                />
            </div>
            <div className='main-window d-flex flex-row flex-grow-1 flex-shrink-1'>
                {renderBoard(thisPlayer, otherPlayer)}
                {cardToZoom && <CardZoom card={cardToZoom} />}
                <div className='right-side d-flex flex-row'>
                    <div className='d-flex flex-column justify-content-around'>
                        <div className='h-50'></div>
                        <div className='inset-pane h-50 d-flex flex-column justify-content-end'>
                            {isSpectating() ? (
                                <div />
                            ) : (
                                <ActivePlayerPrompt
                                    cards={cards}
                                    buttons={thisPlayer.buttons}
                                    controls={thisPlayer.controls}
                                    promptText={thisPlayer.menuTitle}
                                    promptTitle={thisPlayer.promptTitle}
                                    onButtonClick={onCommand}
                                    onMouseOver={onMouseOver}
                                    onMouseOut={onMouseOut}
                                    onTitleClick={onTitleClick}
                                    user={user}
                                    phase={thisPlayer.phase}
                                />
                            )}
                            {/*this.getTimer()*/}
                        </div>
                    </div>
                    {showMessages && (
                        <div className='gamechat w-100 flex-grow-1 flex-shrink-1 d-flex flex-column'>
                            <GameChat
                                messages={activeGame.messages}
                                onCardMouseOut={onMouseOut}
                                onCardMouseOver={onMouseOver}
                                onSendChat={sendChatMessage}
                                muted={isSpectating() && activeGame.muteSpectators}
                            />
                        </div>
                    )}
                </div>
            </div>
            <PlayerStats
                agenda={thisPlayer.agenda}
                faction={thisPlayer.faction}
                firstPlayer={thisPlayer.firstPlayer}
                activePlayer={thisPlayer.activePlayer}
                cardPiles={thisPlayer.cardPiles}
                isMe={!isSpectating()}
                manualMode={true}
                muteSpectators={activeGame.muteSpectators}
                numDeckCards={thisPlayer.numDrawCards}
                numMessages={newMessages}
                onMessagesClick={onMessagesClick}
                onCardClick={onCardClick}
                onDragDrop={onDragDrop}
                onToggleVisibilityClick={onToggleDrawDeckVisibleClick}
                onMenuItemClick={onMenuItemClick}
                onShuffleClick={onShuffleClick}
                onMouseOut={onMouseOut}
                onMouseOver={onMouseOver}
                onMuteClick={onMuteClick}
                onSettingsClick={() => setShowModal(true)}
                showControls={!isSpectating() && true}
                showDeck={thisPlayer.showDeck}
                showMessages
                side={BoardSide.Bottom}
                size={settings.cardSize}
                spectating={isSpectating()}
                stats={thisPlayer.stats}
                user={thisPlayer.user}
            />
        </div>
    );
};

export default GameBoard;
