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
    responseTime: number;
    users: UserSummary[];
}

const initialState: LobbyState = {
    isConnected: false,
    isEstablishingConnection: false,
    isMessagePending: false,
    games: [],
    lobbyMessages: [],
    responseTime: -1,
    users: []
};

const lobbySlice = createSlice({
    name: 'lobby',
    initialState,
    reducers: {
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
        receiveGameError: (state, action: PayloadAction<string>) => {
            state.gameError = action.payload;
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
        sendLobbyChat: (state, _) => {
            state.isMessagePending = true;
        },
        sendNewGame: (state, _) => {
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
