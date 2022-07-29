import { Middleware } from 'redux';
import * as signalR from '@microsoft/signalr';
import { lobbyActions } from '../slices/lobby';
import { UserSummary } from '../../types/lobby';
import { getUser } from '../../helpers/UserHelper';

enum LobbyEvent {
    NewUserMessage = 'newuser',
    UserLeftMessage = 'userleft',
    UsersMessage = 'users'
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

            connection.on(LobbyEvent.NewUserMessage, (user: UserSummary) => {
                store.dispatch(lobbyActions.receiveUser({ user }));
            });

            connection.on(LobbyEvent.UserLeftMessage, (user: string) => {
                store.dispatch(lobbyActions.receiveUserLeft({ user }));
            });

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
