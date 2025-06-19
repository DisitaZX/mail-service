import {
    useUpdateStatusMutation,
    useCreateStatusMutation,
    useDeleteStatusMutation,
    useUpdateTaskMutation,
    useCreateTaskMutation,
    useDeleteTaskMutation,
    useUpdateEmailMutation,
    useCreateEmailMutation,
    useDeleteEmailMutation,
    useUpdateRecipientMutation,
    useCreateRecipientMutation,
    useDeleteRecipientMutation
} from '..//../features/api';
import {useEffect, useState} from "react";
import { Form, message } from "antd";
import { useTableData } from "../hooks/useTableData";
import { useTableConfigs } from "../hooks/useTableConfigs";
import { Recipient } from '../../features/entities';

export const useHandlers = () => {
    const {
        statuses,
        tasks,
        recipients,
        refetchStatuses,
        refetchTasks,
        refetchEmails,
        refetchRecipients,
    } = useTableData();

    const {
        tableConfigs
    } = useTableConfigs();

    // Мутации для обновления данных
    const [updateStatus] = useUpdateStatusMutation();
    const [updateTask] = useUpdateTaskMutation();
    const [updateEmail] = useUpdateEmailMutation();
    const [updateRecipient] = useUpdateRecipientMutation();

    // Мутации для создания данных
    const [createStatus] = useCreateStatusMutation();
    const [createTask] = useCreateTaskMutation();
    const [createEmail] = useCreateEmailMutation();
    const [createRecipient] = useCreateRecipientMutation();

    // Мутации для удаления данных
    const [deleteStatus] = useDeleteStatusMutation();
    const [deleteTask] = useDeleteTaskMutation();
    const [deleteEmail] = useDeleteEmailMutation();
    const [deleteRecipient] = useDeleteRecipientMutation();

    const [activeTable, setActiveTable] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [newItemType, setNewItemType] = useState<string | null>(null);
    const [createForm] = Form.useForm();
    const [form] = Form.useForm();
    const [currentRecord, setCurrentRecord] = useState<any | null>(null);
    const currentTable = activeTable ? tableConfigs[activeTable] : null;

    const handleMutationError = (error: any, messageText: string) => {
        message.error(messageText);
        console.error('Error:', error);
    };

    useEffect(() => {
        if (isModalVisible && currentRecord) {
            form.setFieldsValue({
                ...currentRecord,
                status: currentRecord.status?.id ?? null,
                task: currentRecord.task?.id ?? null,
                recipient_list: currentRecord.recipient_list?.map((r: Recipient) => r.id) || []
            });
        }
    }, [form, isModalVisible, currentRecord]);

    // Показ окна создания записи
    const showCreateModal = () => {
        if (activeTable === 'statuses') setNewItemType('status');
        if (activeTable === 'tasks') setNewItemType('task');
        if (activeTable === 'emails') setNewItemType('email');
        if (activeTable === 'recipients') setNewItemType('recipient');
        setIsCreateModalVisible(true);
        createForm.resetFields();
    };

    // Обработчик удаления записи
    const handleDelete = async () => {
        try {
            switch (activeTable) {
                case 'recipients':
                    await deleteRecipient(currentRecord.id).unwrap();
                    break
                case 'statuses':
                    await deleteStatus(currentRecord.id).unwrap();
                    break;
                case 'tasks':
                    await deleteTask(currentRecord.id).unwrap();
                    break;
                case 'emails':
                    await deleteEmail(currentRecord.id).unwrap();
                    break;
            }

            // Обновляем данные
            if (activeTable === 'statuses') refetchStatuses();
            if (activeTable === 'tasks') refetchTasks();
            if (activeTable === 'emails') refetchEmails();
            if (activeTable === 'recipients') refetchRecipients();

            message.success('Данные успешно удалены');
            setIsModalVisible(false);

        } catch (error) {
            handleMutationError(error, 'Ошибка при удалении записи');
        }
    }

    // Обработчик создания записи
    const handleCreate = async () => {
        try {
            const values = await createForm.validateFields();
            switch (newItemType) {
                case 'recipient':
                    await createRecipient(values).unwrap();
                    message.success('Пользователь успешно создан');
                    break;
                case 'status':
                    await createStatus(values).unwrap();
                    message.success('Статус успешно создан');
                    break;
                case 'task':
                    await createTask(values).unwrap();
                    message.success('Задача успешно создана');
                    break;
                case 'email':
                    const fullValues = {
                        ...values,
                        status: values.status ? statuses?.find(s => s.id === values.status) : null,
                        task: values.task ? tasks?.find(t => t.id === values.task) : null,
                        recipient_list: values.recipient_list?.map((id: number) =>
                            recipients?.find(r => r.id === id)
                        ).filter(Boolean) || null
                    }
                    await createEmail(fullValues).unwrap();
                    message.success('Сообщение успешно создано');
                    break;
            }
            setIsCreateModalVisible(false);
            createForm.resetFields();

            // Обновляем данные
            if (activeTable === 'statuses') refetchStatuses();
            if (activeTable === 'tasks') refetchTasks();
            if (activeTable === 'emails') refetchEmails();
            if (activeTable === 'recipients') refetchRecipients();

        } catch (error) {
            handleMutationError(error, 'Ошибка при создании записи');
        }
    };

    // Обработчик обновлентя записи
    const handleSubmit = async (values: any) => {
        try {
            if (!currentRecord) return;
            switch (activeTable) {
                case 'recipients':
                    await updateRecipient({ id: currentRecord.id, ...values }).unwrap();
                    break
                case 'statuses':
                    await updateStatus({ id: currentRecord.id, ...values }).unwrap();
                    break;
                case 'tasks':
                    await updateTask({ id: currentRecord.id, ...values }).unwrap();
                    break;
                case 'emails':
                    const fullValues = {
                        ...values,
                        status: values.status ? statuses?.find(s => s.id === values.status) : null,
                        task: values.task ? tasks?.find(t => t.id === values.task) : null,
                        recipient_list: values.recipient_list?.map((id: number) =>
                            recipients?.find(r => r.id === id)
                        ).filter(Boolean) || null
                    }
                    await updateEmail({ id: currentRecord.id, ...fullValues }).unwrap();
                    break;
            }

            message.success('Данные успешно обновлены');
            setIsModalVisible(false);

            // Обновляем данные
            if (activeTable === 'statuses') refetchStatuses();
            if (activeTable === 'tasks') refetchTasks();
            if (activeTable === 'emails') {refetchEmails(); refetchTasks(); refetchRecipients(); refetchStatuses()}
            if (activeTable === 'recipients') refetchRecipients();

        } catch (error) {
            handleMutationError(error, 'Ошибка при обновлении данных');
        }
    };

    return {
        showCreateModal,
        handleCreate,
        handleSubmit,
        handleDelete,
        activeTable,
        setActiveTable,
        isModalVisible,
        setIsModalVisible,
        isCreateModalVisible,
        setIsCreateModalVisible,
        newItemType,
        setNewItemType,
        createForm,
        form,
        currentRecord,
        setCurrentRecord,
        currentTable,
    }
}
