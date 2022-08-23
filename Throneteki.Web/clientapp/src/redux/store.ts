import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import lobbyReducer from './slices/lobby';
import lobbyMiddleware from './middleware/lobby';
import { apiSlice } from './api/apiSlice';

export const store = configureStore({
    reducer: {
        lobby: lobbyReducer,
        [apiSlice.reducerPath]: apiSlice.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(lobbyMiddleware).concat(apiSlice.middleware)
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
