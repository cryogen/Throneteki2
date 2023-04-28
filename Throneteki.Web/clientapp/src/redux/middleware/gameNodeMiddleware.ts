import { Middleware } from 'redux';
import { Socket, io } from 'socket.io-client';

import { HandOff } from '../../types/lobby';
import { gameNodeActions } from '../slices/gameNodeSlice';
import { getUser } from '../../helpers/UserHelper';

const gameNodeMiddleware: Middleware = (store) => {
    let connection: Socket | null = null;
    let pingSentTime: Date;

    return (next) => (action) => {
        const isConnectionEstablished = connection && store.getState().lobby.isConnected;
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

            connection.on('connect', () => {
                store.dispatch(gameNodeActions.connectionEstablished());

                connection?.emit('ping');
                pingSentTime = new Date();
            });
            // .catch((err) => lobbyActions.connectionFailed(err));

            // connection.on(LobbyEvent.PongMessage, () => {
            //     store.dispatch(
            //         lobbyActions.receivePing({
            //             responseTime: new Date().getTime() - pingSentTime.getTime()
            //         })
            //     );

            //     setTimeout(() => {
            //         connection?.invoke('ping');
            //         pingSentTime = new Date();
            //     }, 2 * 1000 * 60);
            // });
        }

        if (!isConnectionEstablished || !connection) {
            next(action);

            return;
        }

        next(action);
    };
};

export default gameNodeMiddleware;
