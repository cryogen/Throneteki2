import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';
import lobbyReducer from './slices/lobbySlice';
import lobbyMiddleware from './middleware/lobbyMiddleware';
import gameNodeReducer from './slices/gameNodeSlice';
import gameNodeMiddleware from './middleware/gameNodeMiddleware';

export const store = configureStore({
    reducer: {
        lobby: lobbyReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
        gameNode: gameNodeReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(lobbyMiddleware)
            .concat(apiSlice.middleware)
            .concat(gameNodeMiddleware)
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
