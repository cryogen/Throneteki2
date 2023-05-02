import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HandOff } from '../../types/lobby';

export interface GameNodeState {
    connection?: signalR.HubConnection | null;
    gameHost?: string;
    currentGame?: string;
    isConnected: boolean;
    isEstablishingConnection: boolean;
    responseTime: number;
    rootGameState?: string;
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
        },
        receieveGameState: (state, action: PayloadAction<string>) => {
            state.currentGame = action.payload;
        },
        responseTimeReceived: (state, action: PayloadAction<number>) => {
            state.responseTime = action.payload;
        },
        setRootState: (state, action: PayloadAction<string>) => {
            state.rootGameState = action.payload;
        }
    }
});

export const gameNodeActions = gameNodeSlice.actions;

export default gameNodeSlice.reducer;
