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
        },
        paramsSerializer: (params: Record<string, unknown>) => {
            const queryStr = new URLSearchParams();

            for (const param in params) {
                if (!Array.isArray(params[param])) {
                    queryStr.append(param, params[param] as string);
                } else {
                    let index = 0;
                    for (const arrayVal of params[param] as Array<Record<string, unknown>>) {
                        for (const arrayParam in arrayVal) {
                            queryStr.append(
                                `${param}[${index}].${arrayParam}`,
                                arrayVal[arrayParam] as string
                            );
                        }

                        index++;
                    }
                }
            }
            return queryStr.toString();
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
        getDeck: builder.query({
            query: (deckId) => `/decks/${deckId}`
        }),
        getDecks: builder.query({
            query: (loadOptions) => {
                return {
                    url: '/decks',
                    params: {
                        pageSize: loadOptions.pageSize,
                        pageNumber: loadOptions.pageIndex,
                        sorting: loadOptions.sorting,
                        filters: loadOptions.columnFilters
                    }
                };
            }
        }),
        getFactions: builder.query({
            query: () => '/data/factions'
        }),
        getFilterOptionsForDecks: builder.query({
            query: ({ column, columnFilters }) => ({
                url: `/decks/groupFilter`,
                params: {
                    column: column,
                    filters: columnFilters
                }
            })
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
        }),
        linkThronesDbAccount: builder.mutation({
            query: () => ({ url: '/user/link-tdb', method: 'POST' })
        }),
        toggleDeckFavourite: builder.mutation({
            query: (deckId) => ({
                url: `/decks/${deckId}/toggleFavourite`,
                method: 'POST'
            })
        }),
        saveUser: builder.mutation({
            query: ({ userId, userDetails }) => ({
                url: `/user/${userId}`,
                method: 'PATCH',
                body: userDetails
            })
        })
    })
});

export const {
    useAddBlockListEntryMutation,
    useAddDeckMutation,
    useGetBlockListQuery,
    useGetCardsQuery,
    useGetDeckQuery,
    useGetDecksQuery,
    useGetFactionsQuery,
    useGetFilterOptionsForDecksQuery,
    useGetPacksQuery,
    useGetThronesDbDecksQuery,
    useGetThronesDbStatusQuery,
    useImportThronesDbDecksMutation,
    useLinkThronesDbAccountMutation,
    useToggleDeckFavouriteMutation,
    useSaveUserMutation
} = apiSlice;
