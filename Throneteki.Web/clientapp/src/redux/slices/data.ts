import { createSlice } from '@reduxjs/toolkit';
import { ApiState, ApiStateStatus } from './account';

interface DataState extends ApiState {
    factionStatus: ApiStateStatus;
}

const initialState: DataState = {
    status: ApiStateStatus.Idle,
    factionStatus: ApiStateStatus.Idle
};

export const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        clearFactionState: (state) => {
            (state.factionStatus = ApiStateStatus.Idle), (state.message = undefined);
        }
    }
});

export const { clearFactionState } = dataSlice.actions;

export default dataSlice.reducer;
