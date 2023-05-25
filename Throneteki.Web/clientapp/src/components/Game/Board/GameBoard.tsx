import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { Trans } from 'react-i18next';
import { ThronetekiUser } from '../../../types/user';
import { useAuth } from 'react-oidc-context';
import { CardMenuItem, GameCard, GamePlayer } from '../../../types/game';
import classNames from 'classnames';
import PlayerStats from './PlayerStats';
import PlayerBoard from './PlayerBoard';
import { useGetCardsQuery } from '../../../redux/api/apiSlice';
import ActivePlayerPrompt from './ActivePlayerPrompt';
import GameChat from './GameChat';
import { gameNodeActions } from '../../../redux/slices/gameNodeSlice';
import LoadingSpinner from '../../LoadingSpinner';
import { BoardSide, CardLocation } from '../../../types/enums';

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
    faction: null,
    firstPlayer: false,
    name: 'Placeholder',
    numDrawCards: 0,
    numDeckCards: 0,
    plotSelected: false,
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
    const dispatch = useAppDispatch();

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
    const onDragDrop = (card: GameCard, source: CardLocation, target: CardLocation) => {
        dispatch(
            gameNodeActions.sendCardDroppedMessage({
                uuid: card.uuid,
                source: source,
                target: target
            })
        );
    };
    const handleDrawPopupChange = () => true;
    const onMenuItemClick = (card: GameCard, menuItem: CardMenuItem) => {
        dispatch(gameNodeActions.sendMenuItemClickMessage({ card: card.uuid, menuItem }));
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const onMouseOut = (card: GameCard) => {};
    const onMouseOver = () => true;
    const onShuffleClick = () => true;
    const onCommand = (command: string, arg: string, method: string, promptId: string) => {
        dispatch(gameNodeActions.sendPromptClickedMessage({ arg, command, method, promptId }));
    };
    const onTitleClick = () => true;
    const sendChatMessage = (message: string) => {
        dispatch(gameNodeActions.sendGameChatMessage(message));
    };

    const isSpectating = () => !activeGame.players[user.name as string];

    const settings = JSON.parse(user.throneteki_settings);

    return (
        <div className={boardClass}>
            <div className='stats-top'>
                <PlayerStats
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
                    onDrawPopupChange={handleDrawPopupChange}
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
                firstPlayer={thisPlayer.firstPlayer}
                activePlayer={thisPlayer.activePlayer}
                cardPiles={thisPlayer.cardPiles}
                isMe={!isSpectating()}
                manualMode={true}
                //muteSpectators={activeGame.muteSpectators}
                numDeckCards={thisPlayer.numDeckCards}
                //     numMessages={newMessages}
                //    onManualModeClick={onManualModeClick}
                //     onMessagesClick={onMessagesClick}
                onCardClick={onCardClick}
                onDragDrop={onDragDrop}
                onDrawPopupChange={handleDrawPopupChange}
                onMenuItemClick={onMenuItemClick}
                onShuffleClick={onShuffleClick}
                onMouseOut={onMouseOut}
                onMouseOver={onMouseOver}
                //     onMuteClick={onMuteClick}
                //     onSettingsClick={onSettingsClick}
                showControls={!isSpectating() && true}
                //        showManualMode={!isSpectating()}
                //      showMessages
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
