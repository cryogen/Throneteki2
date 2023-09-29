import { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';

import { useAppSelector } from '../../redux/hooks';
import { GameType } from '../../types/enums';
import { Filter } from '../../types/lobby';
import Panel from '../site/Panel';
import GameButtons from './GameButtons';
import GameFilter from './GameFilter';
import GameList from './GameList';
import NewGame from './NewGame';
import PendingGame from './PendingGame';
import Alert, { AlertType } from '../site/Alert';

const filterDefaults: Filter = {
    [GameType.Beginner]: true,
    [GameType.Casual]: true,
    [GameType.Competitive]: true
};

const GameLobby = () => {
    const { t } = useTranslation();
    const auth = useAuth();
    const user = auth.user?.profile;
    const [quickJoin, setQuickJoin] = useState(false);
    const [newGame, setNewGame] = useState(false);
    const [currentFilter, setCurrentFilter] = useState(filterDefaults);
    const { currentGame, games } = useAppSelector((state) => state.lobby);
    const { currentGame: activeGame } = useAppSelector((state) => state.gameNode);

    const topRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const filter = localStorage.getItem('gameFilter');
        if (filter) {
            setCurrentFilter(JSON.parse(filter));
        }
    }, []);

    useEffect(() => {
        if (currentGame) {
            setNewGame(false);
        }
    }, [currentGame]);

    return (
        <div className='mx-auto w-4/5'>
            <div ref={topRef}>
                {newGame && <NewGame quickJoin={quickJoin} onClosed={() => setNewGame(false)} />}
                {currentGame?.started === false && !activeGame && <PendingGame />}
                {/*passwordGame && <PasswordGame />} */}
            </div>
            <Panel title={t('Current Games')} className='mt-3'>
                {!user && (
                    <div className='text-center'>
                        <Alert variant={AlertType.Warning}>
                            {t('Please log in to be able to start a new game')}
                        </Alert>
                    </div>
                )}
                <div className='grid grid-cols-12'>
                    <div className='col-span-2 mr-5 flex flex-col justify-center'>
                        <GameButtons
                            onNewGame={() => {
                                setQuickJoin(false);
                                setNewGame(true);
                            }}
                        />
                    </div>
                    <div className='col-span-10'>
                        <GameFilter
                            filter={currentFilter}
                            onFilterChanged={(filter: Filter) => {
                                setCurrentFilter(filter);
                                localStorage.setItem('gameFilter', JSON.stringify(filter));
                            }}
                        />
                    </div>
                </div>
                <div className='mt-3'>
                    <div className='text-center'>
                        {games.length === 0 ? (
                            <Alert variant={AlertType.Info}>
                                <Trans>
                                    No games are currently in progress. Click the buttons above to
                                    start one.
                                </Trans>
                            </Alert>
                        ) : (
                            <GameList
                                games={games}
                                gameFilter={currentFilter}
                                onJoinOrWatchClick={() => topRef.current?.scrollIntoView(false)}
                            />
                        )}
                    </div>
                </div>
            </Panel>
        </div>
    );
};

export default GameLobby;
