import { baseApi } from '../../shared/api/baseApi'
import { Task } from '../entities'

export const taskApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getTasks: build.query<Task[], void>({
            query: () => 'tasks/',
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'Task' as const, id })), 'Task']
                    : ['Task'],
        }),
        getTaskById: build.query<Task, number>({
            query: (id) => `tasks/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Task', id }],
        }),
        createTask: build.mutation<Task, Partial<Task>>({
            query: (body) => ({
                url: 'tasks/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Task'],
        }),
        updateTask: build.mutation<Task, Partial<Task>>({
            query: ({ id, ...body }) => ({
                url: `tasks/${id}/`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Task', id }],
        }),
        deleteTask: build.mutation<void, number>({
            query: (id) => ({
                url: `tasks/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Task'],
        }),
    }),
})

export const {
    useGetTasksQuery,
    useGetTaskByIdQuery,
    useCreateTaskMutation,
    useUpdateTaskMutation,
    useDeleteTaskMutation,
} = taskApi