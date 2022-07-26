import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getUser } from '../../helpers/UserHelper';

export interface ApiError {
    data: {
        message: string;
        success: boolean;
    };
    status: number;
}

export const apiSlice = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: '/api',
        prepareHeaders: (headers, {}) => {
            const user = getUser();
            const token = user?.access_token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        }
    }) as BaseQueryFn<string | FetchArgs, unknown, ApiError, unknown>,
    endpoints: (builder) => ({
        getBlockList: builder.query({
            query: (userId) => `/user/${userId}/blocklist`
        }),
        addBlockListEntry: builder.mutation({
            query: (entry) => ({
                url: `/user/${entry.userId}/blocklist`,
                method: 'POST',
                body: { userName: entry.blockee }
            })
        })
    })
});

export const { useGetBlockListQuery, useAddBlockListEntryMutation } = apiSlice;
