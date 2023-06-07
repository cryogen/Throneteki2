import React from 'react';
import classNames from 'classnames';

import { GameType } from '../../types/enums';
import { Filter, LobbyGame } from '../../types/lobby';
import { useTranslation } from 'react-i18next';
import Game from './Game';
import { useAuth } from 'react-oidc-context';
import { useAppDispatch } from '../../redux/hooks';
import { lobbyActions } from '../../redux/slices/lobbySlice';

interface GameTypeGroupProps {
    currentGame?: LobbyGame;
    filter: Filter;
    gameType: GameType;
    games: LobbyGame[];
    isAdmin: boolean;
}

const GameTypeGroup = ({ currentGame, filter, gameType, games, isAdmin }: GameTypeGroupProps) => {
    const { t } = useTranslation();
    const auth = useAuth();
    const user = auth.user?.profile;
    const dispatch = useAppDispatch();

    const gameHeaderClass = classNames('game-header', {
        ['bg-success']: gameType === GameType.Beginner,
        ['bg-warning']: gameType === GameType.Casual,
        ['bg-danger']: gameType === GameType.Competitive
    });

    const canJoin = (game: LobbyGame) => {
        if (!user || currentGame || game.started || game.full) {
            console.info(!user, currentGame, game.started, game.full);
            return false;
        }

        return true;
    };

    const canWatch = (game: LobbyGame) => {
        return !currentGame && game.allowSpectators;
    };

    const joinGame = (game: LobbyGame) => {
        if (game.needsPassword) {
            //  joinPasswordGame(game, 'Join');
        } else {
            dispatch(lobbyActions.sendJoinGame(game.id));
        }

        // if (this.props.onJoinOrWatchClick) {
        //     this.props.onJoinOrWatchClick();
        // }
    };

    const gamesToReturn: JSX.Element[] = [];

    for (const game of games) {
        if (filter.showOnlyNewGames && game.started) {
            continue;
        }

        if (!filter[game.gameType]) {
            continue;
        }

        if (!game.started && game.gamePrivate && !isAdmin) {
            continue;
        }

        gamesToReturn.push(
            <Game
                key={game.id}
                game={game}
                showJoinButton={canJoin(game)}
                showWatchButton={canWatch(game)}
                onJoinGame={joinGame}
                //         onRemoveGame={this.removeGame.bind(this, game)}
                //          onWatchGame={this.watchGame.bind(this, game)}
                isAdmin={isAdmin}
            />
        );
    }

    return (
        <>
            <div className={gameHeaderClass}>
                {t(gameType)} ({gamesToReturn.length})
            </div>
            {gamesToReturn}
        </>
    );
};

export default GameTypeGroup;
