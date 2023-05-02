import { Middleware } from 'redux';
import { Socket, io } from 'socket.io-client';

import { HandOff } from '../../types/lobby';
import { gameNodeActions } from '../slices/gameNodeSlice';
import { getUser } from '../../helpers/UserHelper';

const gameNodeMiddleware: Middleware = (store) => {
    let connection: Socket | null = null;

    return (next) => (action) => {
        const isConnectionEstablished = connection && store.getState().gameNode.isConnected;
        const user = getUser();
        if (gameNodeActions.startConnecting.match(action)) {
            const handOff = action.payload as unknown as HandOff;
            connection = io(handOff.url, {
                auth: {
                    token: user?.access_token || ''
                },
                path: '/' + handOff.name + '/socket.io',
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5
            });

            connection.connect();

            setInterval(() => {
                const start = Date.now();

                connection?.volatile.emit('ping', () => {
                    const latency = Date.now() - start;
                    store.dispatch(gameNodeActions.responseTimeReceived(latency));
                });
            }, 2 * 1000 * 60);

            connection.on('connect', () => {
                store.dispatch(gameNodeActions.connectionEstablished());

                connection?.emit('ping');
            });

            connection.on('pong', (responseTime) => {
                store.dispatch(gameNodeActions.responseTimeReceived(responseTime));
            });

            connection.on('gamestate', (game) => {
                let gameState;

                if (store.getState().gameNode.rootGameState) {
                    // patch
                } else {
                    gameState = game;
                    store.dispatch(gameNodeActions.setRootState(game));
                }

                store.dispatch(gameNodeActions.receieveGameState(gameState));
            });
        }

        if (!isConnectionEstablished || !connection) {
            next(action);

            return;
        }

        next(action);
    };
};

export default gameNodeMiddleware;
