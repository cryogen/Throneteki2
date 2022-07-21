import { Middleware } from 'redux';
import { User } from 'oidc-client-ts';
import * as signalR from '@microsoft/signalr';
import { lobbyActions } from '../slices/lobby';
import { UserSummary } from '../../types/lobby';

enum LobbyEvent {
    UsersMessage = 'users'
}

function getUser() {
    const oidcStorage = sessionStorage.getItem('oidc.user:https://localhost:44460/:throneteki');
    if (!oidcStorage) {
        return null;
    }

    return User.fromStorageString(oidcStorage);
}

const chatMiddleware: Middleware = (store) => {
    let connection: signalR.HubConnection | null = null;

    return (next) => (action) => {
        const isConnectionEstablished = connection && store.getState().lobby.isConnected;

        if (lobbyActions.startConnecting.match(action)) {
            connection = new signalR.HubConnectionBuilder()
                .withUrl('/lobbyhub', {
                    accessTokenFactory: () => {
                        const user = getUser();
                        return user?.access_token || '';
                    }
                })
                .withAutomaticReconnect()
                .build();

            connection.start().then(() => {
                store.dispatch(lobbyActions.connectionEstablished());
            });
            // .catch((err) => lobbyActions.connectionFailed(err));

            connection.on(LobbyEvent.UsersMessage, (users: UserSummary[]) => {
                store.dispatch(lobbyActions.receiveUsers({ users }));
            });
        }

        if (lobbyActions.disconnect.match(action) && isConnectionEstablished) {
            connection?.stop().then(() => {
                store.dispatch(lobbyActions.disconnect());

                connection = null;
            });
        }

        next(action);
    };
};

export default chatMiddleware;
