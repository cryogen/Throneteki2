import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserSummary } from '../../types/lobby';

export interface LobbyState {
    isConnected: boolean;
    isEstablishingConnection: boolean;
    responseTime: number;
    users: UserSummary[];
}

const initialState: LobbyState = {
    isEstablishingConnection: false,
    isConnected: false,
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
        }
        // connectionFailed: (state) => {
        //     state.isEstablishingConnection = false;
        // }
    }
});

export const lobbyActions = lobbySlice.actions;

export default lobbySlice.reducer;
