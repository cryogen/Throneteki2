import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HandOff, LobbyGame, LobbyMessage, UserSummary } from '../../types/lobby';

export interface LobbyState {
    connection?: signalR.HubConnection | null;
    currentGame?: LobbyGame;
    gameError?: string;
    games: LobbyGame[];
    handOff?: HandOff;
    isConnected: boolean;
    isEstablishingConnection: boolean;
    isMessagePending: boolean;
    lobbyMessages: LobbyMessage[];
    noChat: boolean;
    responseTime: number;
    users: UserSummary[];
}

const initialState: LobbyState = {
    isConnected: false,
    isEstablishingConnection: false,
    isMessagePending: false,
    games: [],
    lobbyMessages: [],
    noChat: false,
    responseTime: -1,
    users: []
};

const lobbySlice = createSlice({
    name: 'lobby',
    initialState,
    reducers: {
        clearNoChatStatus: (state) => {
            state.noChat = false;
        },
        startConnecting: (state) => {
            state.isEstablishingConnection = true;
        },
        connectionEstablished: (state) => {
            state.isConnected = true;
            state.isEstablishingConnection = true;
        },
        disconnect: (state) => {
            state.isConnected = false;
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        leaveGame: () => {},
        receiveClearGameState: (state) => {
            state.currentGame = undefined;
        },
        receiveGameError: (state, action: PayloadAction<string>) => {
            state.gameError = action.payload;
        },
        receiveGames: (state, action: PayloadAction<LobbyGame[]>) => {
            state.games = action.payload;
        },
        receiveGameState: (state, action: PayloadAction<LobbyGame>) => {
            state.currentGame = action.payload;
        },
        receiveHandOff: (state, action: PayloadAction<HandOff>) => {
            state.handOff = action.payload;
        },
        receiveLobbyChat: (state, action: PayloadAction<LobbyMessage>) => {
            state.lobbyMessages.push(action.payload);
            state.isMessagePending = false;
        },
        receiveLobbyMessages(state, action: PayloadAction<LobbyMessage[]>) {
            state.lobbyMessages = action.payload;
        },
        receiveNewGame(state, action: PayloadAction<LobbyGame>) {
            state.games.push(action.payload);
        },
        receiveNoChat(state, _action: PayloadAction) {
            state.noChat = true;
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
        receiveUpdateGame(_state, _action: PayloadAction<LobbyGame>) {},
        receiveRemoveGame(state, action: PayloadAction<LobbyGame>) {
            state.games = state.games.filter((g) => g.id !== action.payload.id);

            if (action.payload.id === state.currentGame?.id) {
                state.currentGame = null;
            }
        },
        receiveRemoveGames(state, action: PayloadAction<LobbyGame[]>) {
            state.games = state.games.filter((g) => action.payload.some((rg) => rg.id !== g.id));

            if (!state.games.find((g) => g.id === state.currentGame?.id)) {
                state.currentGame = null;
            }
        },
        receiveRemoveMessage(
            state,
            action: PayloadAction<{ messageId: number; removedBy?: string }>
        ) {
            const message = state.lobbyMessages.find((m) => m.id === action.payload.messageId);
            if (message) {
                message.deleted = true;
                message.deletedBy = action.payload.removedBy;
            }
        },
        receivePing: (
            state,
            action: PayloadAction<{
                responseTime: number;
            }>
        ) => {
            state.responseTime = action.payload.responseTime;
        },
        receiveUser: (
            state,
            action: PayloadAction<{
                user: UserSummary;
            }>
        ) => {
            if (!state.users.some((user) => user.username === action.payload.user.username)) {
                state.users.push(action.payload.user);
            }
        },
        receiveUserLeft: (
            state,
            action: PayloadAction<{
                user: string;
            }>
        ) => {
            state.users = state.users.filter((user) => user.username !== action.payload.user);
        },
        receiveUsers: (
            state,
            action: PayloadAction<{
                users: UserSummary[];
            }>
        ) => {
            state.users = action.payload.users;
        },
        sendJoinGame: (state, _: PayloadAction<string>) => {
            state.isMessagePending = true;
        },
        sendLeaveGame: (state) => {
            state.isMessagePending = true;
        },
        sendLobbyChat: (state, _) => {
            state.isMessagePending = true;
        },
        sendNewGame: (state, _) => {
            state.isMessagePending = true;
        },
        sendRemoveLobbyMessage: (state, _) => {
            state.isMessagePending = true;
        },
        sendSelectDeck: (state, _) => {
            state.isMessagePending = true;
        },
        sendStartGame: (state) => {
            state.gameError = undefined;
            state.isMessagePending = true;
        }
        // connectionFailed: (state) => {
        //     state.isEstablishingConnection = false;
        // }
    }
});

export const lobbyActions = lobbySlice.actions;

export default lobbySlice.reducer;
