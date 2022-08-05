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
        addBlockListEntry: builder.mutation({
            query: (entry) => ({
                url: `/user/${entry.userId}/blocklist`,
                method: 'POST',
                body: { userName: entry.blockee }
            })
        }),
        addDeck: builder.mutation({
            query: (deck) => ({
                url: '/decks/',
                method: 'POST',
                body: deck
            })
        }),
        getBlockList: builder.query({
            query: (userId) => `/user/${userId}/blocklist`
        }),
        getCards: builder.query({
            query: () => '/data/cards'
        }),
        getFactions: builder.query({
            query: () => '/data/factions'
        }),
        getPacks: builder.query({
            query: () => '/data/packs'
        }),
        getThronesDbDecks: builder.query({
            query: () => '/decks/thronesdb'
        }),
        getThronesDbStatus: builder.query({
            query: () => '/decks/thronesdb/status'
        }),
        importThronesDbDecks: builder.mutation({
            query: (deckIds) => ({
                url: '/decks/thronesdb',
                method: 'POST',
                body: deckIds
            })
        })
    })
});

export const {
    useAddBlockListEntryMutation,
    useAddDeckMutation,
    useGetBlockListQuery,
    useGetCardsQuery,
    useGetFactionsQuery,
    useGetPacksQuery,
    useGetThronesDbDecksQuery,
    useGetThronesDbStatusQuery,
    useImportThronesDbDecksMutation
} = apiSlice;
