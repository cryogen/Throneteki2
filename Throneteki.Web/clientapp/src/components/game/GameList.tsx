import { useMemo } from 'react';
import { Trans } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { GameType } from '../../types/enums';
import { Filter, LobbyGame } from '../../types/lobby';
import { ThronetekiUser } from '../../types/user';
import { Permission } from '../navigation/menus';
import GameTypeGroup from './GameTypeGroup';
import Alert, { AlertType } from '../site/Alert';

interface GameListProps {
    currentGame?: LobbyGame;
    games: LobbyGame[];
    gameFilter: Filter;
    onJoinOrWatchClick: () => void;
}

const GameList = ({ currentGame, games, gameFilter }: GameListProps) => {
    let content;
    const auth = useAuth();

    const user = auth.user?.profile as ThronetekiUser;
    const isAdmin = user && user.role && user.role.includes(Permission.CanManageGames);

    const groupedGames = useMemo(() => {
        const grouping: Record<GameType, LobbyGame[]> = {
            casual: [],
            beginner: [],
            competitive: []
        };

        for (const game of games) {
            if (!game.started && game.gamePrivate && !isAdmin) {
                continue;
            }

            grouping[game.gameType].push(game);
        }

        return grouping;
    }, [games, isAdmin]);

    const gameList = [];

    for (const gameType of [GameType.Beginner, GameType.Casual, GameType.Competitive]) {
        if (gameFilter[gameType] && groupedGames[gameType].length > 0) {
            gameList.push(
                <GameTypeGroup
                    key={gameType}
                    currentGame={currentGame}
                    filter={gameFilter}
                    isAdmin={isAdmin}
                    gameType={gameType}
                    games={groupedGames[gameType]}
                />
            );
        }
    }

    if (gameList.length === 0) {
        content = (
            <Alert variant={AlertType.Info}>
                <Trans>There are no games matching the filters you have selected.</Trans>
            </Alert>
        );
    } else {
        content = gameList;
    }

    return <div>{content}</div>;
};

export default GameList;
