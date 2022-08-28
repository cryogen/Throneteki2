import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LobbyMessage, UserSummary } from '../../types/lobby';

export interface LobbyState {
    connection?: signalR.HubConnection | null;
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
        receiveLobbyChat: (state, action: PayloadAction<LobbyMessage>) => {
            state.lobbyMessages.push(action.payload);
            state.isMessagePending = false;
        },
        receiveLobbyMessages(state, action: PayloadAction<LobbyMessage[]>) {
            state.lobbyMessages = action.payload;
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        sendLobbyChat: (state, _: PayloadAction<string>) => {
            state.isMessagePending = true;
        }
        // connectionFailed: (state) => {
        //     state.isEstablishingConnection = false;
        // }
    }
});

export const lobbyActions = lobbySlice.actions;

export default lobbySlice.reducer;
