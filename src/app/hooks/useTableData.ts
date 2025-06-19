import {
    useGetStatusesQuery,
    useGetTasksQuery,
    useGetEmailsQuery,
    useGetRecipientsQuery,
} from '..//../features/api';

export const useTableData = () => {
    // Загрузка данных из API
    const {
        data: statuses = [],
        isLoading: isStatusesLoading,
        refetch: refetchStatuses
    } = useGetStatusesQuery();

    const {
        data: tasks = [],
        isLoading: isTasksLoading,
        refetch: refetchTasks
    } = useGetTasksQuery();

    const {
        data: emails = [],
        isLoading: isEmailsLoading,
        refetch: refetchEmails
    } = useGetEmailsQuery();

    const {
        data: recipients = [],
        isLoading: isRecipientsLoading,
        refetch: refetchRecipients
    } = useGetRecipientsQuery();

    return {
        statuses,
        tasks,
        emails,
        recipients,
        isLoading: isStatusesLoading || isTasksLoading || isEmailsLoading || isRecipientsLoading,
        refetchStatuses,
        refetchTasks,
        refetchEmails,
        refetchRecipients
    };
}
