import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HandOff } from '../../types/lobby';
import { Game } from '../../types/game';
import { PromptClicked } from '../../types/gameMessages';

export interface GameNodeState {
    connection?: signalR.HubConnection | null;
    gameHost?: string;
    currentGame?: Game;
    isConnected: boolean;
    isEstablishingConnection: boolean;
    isWaitingForResponse: boolean;
    responseTime: number;
    rootGameState?: string;
}

const initialState: GameNodeState = {
    isConnected: false,
    isEstablishingConnection: false,
    isWaitingForResponse: false,
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
        receieveGameState: (state, action: PayloadAction<Game>) => {
            state.currentGame = action.payload;
            state.isWaitingForResponse = false;
        },
        responseTimeReceived: (state, action: PayloadAction<number>) => {
            state.responseTime = action.payload;
        },
        sendCardClickedMessage: (state, _: PayloadAction<string>) => {
            state.isWaitingForResponse = true;
        },
        sendPromptClickedMessage: (state, _: PayloadAction<PromptClicked>) => {
            state.isWaitingForResponse = true;
        },
        setRootState: (state, action: PayloadAction<string>) => {
            state.rootGameState = action.payload;
        }
    }
});

export const gameNodeActions = gameNodeSlice.actions;

export default gameNodeSlice.reducer;
