import { baseApi } from '../../shared/api/baseApi'
import { Email } from '../entities'

export const emailApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getEmails: build.query<Email[], void>({
            query: () => 'emails/',
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'Email' as const, id })), 'Email']
                    : ['Email'],
        }),
        getEmailById: build.query<Email, number>({
            query: (id) => `emails/${id}/`,
            providesTags: (_result, _error, id) => [{ type: 'Email', id }],
        }),
        createEmail: build.mutation<Email, Partial<Email>>({
            query: (body) => ({
                url: 'emails/', // POST на общий endpoint
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Email'],
        }),
        updateEmail: build.mutation<Email, { id: number; data: Partial<Email> }>({
            query: ({ id, ...body }) => ({
                url: `emails/${id}/`, // PUT/PATCH на конкретный ID
                method: 'PATCH',
                body: body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Email', id }],
        }),
        deleteEmail: build.mutation<void, number>({
            query: (id) => ({
                url: `emails/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Email'],
        }),
    }),
})

export const {
    useGetEmailsQuery,
    useGetEmailByIdQuery,
    useCreateEmailMutation,
    useUpdateEmailMutation,
    useDeleteEmailMutation,
} = emailApi