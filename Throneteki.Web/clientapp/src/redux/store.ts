import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { reducer as toastrReducer } from 'react-redux-toastr';

import { apiSlice } from './api/apiSlice';
import lobbyReducer from './slices/lobbySlice';
import lobbyMiddleware from './middleware/lobbyMiddleware';
import gameNodeReducer from './slices/gameNodeSlice';
import gameNodeMiddleware from './middleware/gameNodeMiddleware';

export const store = configureStore({
    reducer: {
        lobby: lobbyReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
        gameNode: gameNodeReducer,
        toastr: toastrReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(apiSlice.middleware)
            .concat(lobbyMiddleware)
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
