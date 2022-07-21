import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { saveProfile } from '../../api/userApi';
import { NewProfileDetails } from '../../components/Account/Profile';
import { ApiState, ApiStateStatus } from './account';

export type UserState = ApiState;

const initialState: UserState = {
    status: ApiStateStatus.Idle
};

export const saveProfileAsync = createAsyncThunk(
    'user/saveprofile',
    async (profile: NewProfileDetails) => {
        const response = await saveProfile(profile);

        const ret = {
            response: response.data
        };

        return ret;
    }
);

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearUserState: (state) => {
            (state.status = ApiStateStatus.Idle), (state.message = undefined);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(saveProfileAsync.pending, (state) => {
                state.status = ApiStateStatus.Loading;
            })
            .addCase(saveProfileAsync.fulfilled, (state, action) => {
                state.message = action.payload.response.message;

                if (!action.payload.response.success) {
                    state.status = ApiStateStatus.Failed;
                } else {
                    state.status = ApiStateStatus.Success;
                }
            })
            .addCase(saveProfileAsync.rejected, (state) => {
                state.status = ApiStateStatus.Failed;
                state.message =
                    'An error occured while saving your profile. Please try again later';
            });
    }
});

export const { clearUserState } = userSlice.actions;

export default userSlice.reducer;
