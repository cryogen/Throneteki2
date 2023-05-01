import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HandOff } from '../../types/lobby';

export interface GameNodeState {
    connection?: signalR.HubConnection | null;
    isConnected: boolean;
    isEstablishingConnection: boolean;
    responseTime: number;
    gameHost?: string;
}

const initialState: GameNodeState = {
    isConnected: false,
    isEstablishingConnection: false,
    responseTime: -1
};

const gameNodeSlice = createSlice({
    name: 'gameNode',
    initialState,
    reducers: {
        startConnecting: (state, action: PayloadAction<HandOff>) => {
            state.isEstablishingConnection = true;
            state.gameHost = action.payload.url;
        },
        connectionEstablished: (state) => {
            state.isConnected = true;
            state.isEstablishingConnection = true;
        },
        disconnect: (state) => {
            state.isConnected = false;
        }
    }
});

export const gameNodeActions = gameNodeSlice.actions;

export default gameNodeSlice.reducer;
