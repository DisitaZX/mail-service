import { baseApi } from '../../shared/api/baseApi'
import { Status } from '../entities'

export const statusApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getStatuses: build.query<Status[], void>({
            query: () => 'statuses/',
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'Status' as const, id })), 'Status']
                    : ['Status'],
        }),
        getStatusById: build.query<Status, number>({
            query: (id) => `statuses/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Status', id }],
        }),
        createStatus: build.mutation<Status, Partial<Status>>({
            query: (body) => ({
                url: 'statuses/', // POST на общий endpoint
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Status'],
        }),

        updateStatus: build.mutation<Status, { id: number; data: Partial<Status> }>({
            query: ({ id, data }) => ({
                url: `statuses/${id}/`, // PUT/PATCH на конкретный ID
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Status', id }],
        }),
        deleteStatus: build.mutation<void, number>({
            query: (id) => ({
                url: `statuses/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Status'],
        }),
    }),
})

export const {
    useGetStatusesQuery,
    useGetStatusByIdQuery,
    useCreateStatusMutation,
    useUpdateStatusMutation,
    useDeleteStatusMutation,
} = statusApi