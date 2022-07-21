import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginAccount, registerAccount } from '../../api/accountApi';
import { LoginDetails } from '../../components/Account/Login';
import { RegisterDetails } from '../../components/Account/Register';

export enum ApiStateStatus {
    Idle = 'idle',
    Loading = 'loading',
    Failed = 'failed',
    Success = 'success'
}

export interface ApiState {
    status: ApiStateStatus;
    message?: string | string[];
}

export interface AccountState extends ApiState {
    returnUrl?: string;
}

const initialState: AccountState = {
    status: ApiStateStatus.Idle
};

export const loginAsync = createAsyncThunk('account/login', async (loginDetails: LoginDetails) => {
    const response = await loginAccount(loginDetails.username, loginDetails.password);

    const ret = {
        returnUrl: loginDetails.returnUrl,
        response: response.data
    };

    return ret;
});

export const registerAsync = createAsyncThunk(
    'account/register',
    async (registerDetails: RegisterDetails) => {
        const response = await registerAccount(
            registerDetails.username,
            registerDetails.email,
            registerDetails.password
        );

        const ret = {
            response: response.data
        };

        return ret;
    }
);

export const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        clearState: (state) => {
            (state.status = ApiStateStatus.Idle), (state.message = undefined);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginAsync.pending, (state) => {
                state.status = ApiStateStatus.Loading;
            })
            .addCase(loginAsync.fulfilled, (state, action) => {
                if (!action.payload.response.success) {
                    state.message = action.payload.response.message;
                    state.status = ApiStateStatus.Failed;
                } else {
                    state.status = ApiStateStatus.Success;
                    state.returnUrl = action.payload.returnUrl;
                }
            })
            .addCase(loginAsync.rejected, (state) => {
                state.status = ApiStateStatus.Failed;
            })
            .addCase(registerAsync.pending, (state) => {
                state.status = ApiStateStatus.Loading;
            })
            .addCase(registerAsync.fulfilled, (state, action) => {
                state.message = action.payload.response.message;

                if (!action.payload.response.success) {
                    state.status = ApiStateStatus.Failed;
                } else {
                    state.status = ApiStateStatus.Success;
                }
            })
            .addCase(registerAsync.rejected, (state) => {
                state.status = ApiStateStatus.Failed;
                state.message =
                    'An error occured while registering your account. Please try again later';
            });
    }
});

export const { clearState } = accountSlice.actions;

export default accountSlice.reducer;
