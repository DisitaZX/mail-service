import { baseApi } from '../../shared/api/baseApi'
import {Recipient} from "../entities";

export const recipientApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getRecipients: build.query<Recipient[], void>({
            query: () => 'recipients/',
            providesTags: (result) =>
                result
                    ? [...result.map(({id}) => ({type: 'Recipient' as const, id})), 'Recipient']
                    : ['Recipient'],
        }),
        getRecipientById: build.query<Recipient, number>({
            query: (id) => `recipients/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Recipient', id }],
        }),
        createRecipient: build.mutation<Recipient, Partial<Recipient>>({
            query: (body) => ({
                url: 'recipients/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Recipient'],
        }),
        updateRecipient: build.mutation<Recipient, { id: number; data: Partial<Recipient> }>({
            query: ({ id, ...body }) => ({
                url: `recipients/${id}/`, // PUT/PATCH на конкретный ID
                method: 'PATCH',
                body: body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Recipient', id }],
        }),
        deleteRecipient: build.mutation<void, number>({
            query: (id) => ({
                url: `recipients/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Recipient'],
        }),
    })
})

export const {
    useGetRecipientsQuery,
    useGetRecipientByIdQuery,
    useCreateRecipientMutation,
    useUpdateRecipientMutation,
    useDeleteRecipientMutation,
} = recipientApi