import { Middleware } from 'redux';
import * as signalR from '@microsoft/signalr';
import { lobbyActions } from '../slices/lobby';
import { LobbyMessage, UserSummary } from '../../types/lobby';
import { getUser } from '../../helpers/UserHelper';

enum LobbyEvent {
    LobbyChat = 'lobbychat',
    LobbyMessages = 'lobbymessages',
    NewUserMessage = 'newuser',
    PongMessage = 'pong',
    UserLeftMessage = 'userleft',
    UsersMessage = 'users'
}

const chatMiddleware: Middleware = (store) => {
    let connection: signalR.HubConnection | null = null;
    let pingSentTime: Date;

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

                connection?.invoke('ping');
                pingSentTime = new Date();
            });
            // .catch((err) => lobbyActions.connectionFailed(err));

            connection.on(LobbyEvent.LobbyChat, (message: LobbyMessage) => {
                store.dispatch(lobbyActions.receiveLobbyChat(message));
            });

            connection.on(LobbyEvent.LobbyMessages, (messages: LobbyMessage[]) => {
                store.dispatch(lobbyActions.receiveLobbyMessages(messages));
            });

            connection.on(LobbyEvent.NewUserMessage, (user: UserSummary) => {
                store.dispatch(lobbyActions.receiveUser({ user }));
            });

            connection.on(LobbyEvent.UserLeftMessage, (user: string) => {
                store.dispatch(lobbyActions.receiveUserLeft({ user }));
            });

            connection.on(LobbyEvent.UsersMessage, (users: UserSummary[]) => {
                store.dispatch(lobbyActions.receiveUsers({ users }));
            });

            connection.on(LobbyEvent.PongMessage, () => {
                store.dispatch(
                    lobbyActions.receivePing({
                        responseTime: new Date().getTime() - pingSentTime.getTime()
                    })
                );

                setTimeout(() => {
                    connection?.invoke('ping');
                    pingSentTime = new Date();
                }, 2 * 1000 * 60);
            });
        }

        if (!isConnectionEstablished || !connection) {
            next(action);

            return;
        }

        if (lobbyActions.disconnect.match(action)) {
            connection.stop().then(() => {
                store.dispatch(lobbyActions.disconnect());

                connection = null;
            });
        }

        if (lobbyActions.sendLobbyChat.match(action)) {
            connection.send(LobbyEvent.LobbyChat, action.payload);
        }

        next(action);
    };
};

export default chatMiddleware;
