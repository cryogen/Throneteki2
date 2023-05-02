import React, { useEffect, useRef, useState } from 'react';
import { Col, Row, Alert } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';

import { useAppSelector } from '../../redux/hooks';
import { GameType } from '../../types/enums';
import { Filter } from '../../types/lobby';
import Panel from '../Site/Panel';
import GameButtons from './GameButtons';
import GameFilter from './GameFilter';
import GameList from './GameList';
import NewGame from './NewGame';
import PendingGame from './PendingGame';

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
        <Col md={{ offset: 2, span: 8 }}>
            <div ref={topRef}>
                {newGame && <NewGame quickJoin={quickJoin} onClosed={() => setNewGame(false)} />}
                {currentGame?.started === false && !activeGame && <PendingGame />}
                {/*passwordGame && <PasswordGame />} */}
            </div>
            <Panel title={t('Current Games')} className='mt-3'>
                {!user && (
                    <div className='text-center'>
                        <Alert variant='warning'>
                            {t('Please log in to be able to start a new game')}
                        </Alert>
                    </div>
                )}
                <Row className='game-buttons'>
                    <Col sm={4} lg={3} className='d-flex flex-column'>
                        <GameButtons
                            onNewGame={() => {
                                setQuickJoin(false);
                                setNewGame(true);
                            }}
                        />
                    </Col>
                    <Col sm={8} lg={9}>
                        <GameFilter
                            filter={currentFilter}
                            onFilterChanged={(filter: Filter) => {
                                setCurrentFilter(filter);
                                localStorage.setItem('gameFilter', JSON.stringify(filter));
                            }}
                        />
                    </Col>
                </Row>
                <Row className='mt-3'>
                    <Col xs='12' className='text-center'>
                        {games.length === 0 ? (
                            <Alert variant='info'>
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
                    </Col>
                </Row>
            </Panel>
        </Col>
    );
};

export default GameLobby;
