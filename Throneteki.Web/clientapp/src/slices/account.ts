import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginAccount } from '../api/accountApi';
import { LoginDetails } from '../components/Account/Login';

export enum ApiStatus {
    Idle = 'idle',
    Loading = 'loading',
    Failed = 'failed',
    Success = 'success'
}

export interface AccountState {
    status: ApiStatus;
    error?: string;
    returnUrl?: string;
}

const initialState: AccountState = {
    status: ApiStatus.Idle
};

export const loginAsync = createAsyncThunk('account/login', async (loginDetails: LoginDetails) => {
    const response = await loginAccount(loginDetails.username, loginDetails.password);

    const ret = {
        returnUrl: loginDetails.returnUrl,
        response: response.data
    };

    return ret;
});

export const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loginAsync.pending, (state) => {
                state.status = ApiStatus.Loading;
            })
            .addCase(loginAsync.fulfilled, (state, action) => {
                if (!action.payload.response.success) {
                    state.error = action.payload.response.message;
                    state.status = ApiStatus.Failed;
                } else {
                    state.status = ApiStatus.Success;
                    state.returnUrl = action.payload.returnUrl;
                }
            })
            .addCase(loginAsync.rejected, (state) => {
                state.status = ApiStatus.Failed;
            });
    }
});

export const {} = accountSlice.actions;

export default accountSlice.reducer;
