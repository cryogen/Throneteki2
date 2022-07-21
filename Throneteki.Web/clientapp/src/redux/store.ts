import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import accountReducer from './slices/account';
import lobbyReducer from './slices/lobby';
import userReducer from './slices/user';
import lobbyMiddleware from './middleware/lobby';

export const store = configureStore({
    reducer: {
        account: accountReducer,
        lobby: lobbyReducer,
        user: userReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(lobbyMiddleware)
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
