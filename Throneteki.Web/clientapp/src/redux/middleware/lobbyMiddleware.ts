import { Middleware } from 'redux';
import * as signalR from '@microsoft/signalr';
import { lobbyActions } from '../slices/lobbySlice';
import { HandOff, LobbyGame, LobbyMessage, UserSummary } from '../../types/lobby';
import { getUser } from '../../helpers/UserHelper';
import { gameNodeActions } from '../slices/gameNodeSlice';

enum LobbyEvent {
    GameError = 'gameerror',
    GameState = 'gamestate',
    HandOff = 'handoff',
    LobbyChat = 'lobbychat',
    LobbyMessages = 'lobbymessages',
    NewGame = 'newgame',
    NewUserMessage = 'newuser',
    PongMessage = 'pong',
    UserLeftMessage = 'userleft',
    UsersMessage = 'users',
    SelectDeck = 'selectdeck',
    StartGame = 'startgame'
}

const lobbyMiddleware: Middleware = (store) => {
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

            connection.on(LobbyEvent.HandOff, (handOffDetails: HandOff) => {
                store.dispatch(gameNodeActions.startConnecting(handOffDetails));
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

            connection.on(LobbyEvent.NewGame, (game: LobbyGame) => {
                store.dispatch(lobbyActions.receiveNewGame(game));
            });

            connection.on(LobbyEvent.GameState, (game: LobbyGame) => {
                store.dispatch(lobbyActions.receiveGameState(game));
            });

            connection.on(LobbyEvent.GameError, (error: string) => {
                store.dispatch(lobbyActions.receiveGameError(error));
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

        if (lobbyActions.sendNewGame.match(action)) {
            connection.send(LobbyEvent.NewGame, action.payload);
        }

        if (lobbyActions.sendSelectDeck.match(action)) {
            connection.send(LobbyEvent.SelectDeck, action.payload);
        }

        if (lobbyActions.sendStartGame.match(action)) {
            connection.send(LobbyEvent.StartGame, '');
        }

        next(action);
    };
};

export default lobbyMiddleware;
