import React, { useState, useEffect } from 'react';
import { Layout, Table, Empty, Modal, Button, Form, Input, message, Flex, MenuProps, Dropdown, Space, Select } from 'antd';
import { SearchOutlined, DownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Status, Task, Recipient } from "../features/entities";
import 'antd/dist/reset.css';
import './styles/App.css';
import {
    useGetStatusesQuery,
    useUpdateStatusMutation,
    useCreateStatusMutation,
    useDeleteStatusMutation,
    useGetTasksQuery,
    useUpdateTaskMutation,
    useCreateTaskMutation,
    useDeleteTaskMutation,
    useGetEmailsQuery,
    useUpdateEmailMutation,
    useCreateEmailMutation,
    useDeleteEmailMutation,
    useGetRecipientsQuery,
    useUpdateRecipientMutation,
    useCreateRecipientMutation,
    useDeleteRecipientMutation
} from '../features/api';

interface TableConfig<T = any> {
    title: string;
    columns: ColumnsType<T>;
    data: T[];
}

export const App = () => {
    const [activeTable, setActiveTable] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [newItemType, setNewItemType] = useState<string | null>(null);
    const [createForm] = Form.useForm();
    const [form] = Form.useForm();
    const [currentRecord, setCurrentRecord] = useState<any | null>(null);

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

    const tableConfigs: Record<string, TableConfig> = {
        statuses: {
            title: 'Статусы',
            columns: [
                { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id },
                { title: 'Название', dataIndex: 'name', key: 'name' },
                { title: 'Описание', dataIndex: 'description', key: 'description' },
            ],
            data: statuses,
        },
        tasks: {
            title: 'Задачи',
            columns: [
                { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id },
                {
                    title: 'Тема',
                    dataIndex: 'subject',
                    key: 'subject',
                    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
                        <div style={{ padding: 8 }}>
                            <Input
                                placeholder="Поиск по теме"
                                value={selectedKeys[0]}
                                onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                                onPressEnter={() => confirm()}
                                style={{ width: 188, marginBottom: 8, display: 'block' }}
                            />
                            <Button
                                type="primary"
                                onClick={() => confirm()}
                                size="small"
                                style={{ width: 90 }}
                            >
                                Поиск
                            </Button>
                        </div>
                    ),
                    onFilter: (value, record) =>
                        record.subject.toLowerCase().includes(value.toString().toLowerCase()),
                    filterIcon: filtered => (
                        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
                    ),
                },
                { title: 'Содержание', dataIndex: 'body', key: 'body' },
                {
                    title: 'Дата создания',
                    dataIndex: 'created_at',
                    key: 'created_at',
                    render: (date: number) => new Date(date).toLocaleString(),
                    sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
                },
            ],
            data: tasks,
        },
        emails: {
            title: 'Сообщения',
            columns: [
                { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id },
                {
                    title: 'Дата отправки',
                    dataIndex: 'send_at',
                    key: 'send_at',
                    render: (date: number) => new Date(date).toLocaleString()
                },
                {
                    title: 'Статус',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status: Status | null) => status?.name || 'Не указан'
                },
                {
                    title: 'Задача',
                    dataIndex: 'task',
                    key: 'task',
                    render: (task: Task) => task.subject
                },
                {
                    title: 'Получатели',
                    dataIndex: 'recipient_list',
                    key: 'recipient_list',
                    render: (recipients: Recipient[]) => recipients.map(r => r.address).join(', ') || 'Нет получателей'
                },
            ],
            data: emails,
        },
        recipients: {
            title: 'Получатели',
            columns: [
                { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id },
                { title: 'Адрес', dataIndex: 'address', key: 'address' },
            ],
            data: recipients,
        }
    };

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
            message.error('Ошибка при удалении записи');
            console.error('Delete error:', error);
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
            message.error('Ошибка при создании записи');
            console.error('Create error:', error);
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
            message.error('Ошибка при обновлении данных');
            console.error('Update error:', error);
        }
    };

    const currentTable = activeTable ? tableConfigs[activeTable] : null;
    const isLoading = isStatusesLoading || isTasksLoading || isEmailsLoading || isRecipientsLoading;

    const renderFormFields = () => {
        if (!currentTable || !currentRecord) return null;

        return currentTable.columns.map((column: any) => {
            if (column.key === 'id') return null;
            if (column.key === 'created_at') return null;
            if (column.key === 'send_at') return null;

            if (column.key === 'status') {
                return (
                    <Form.Item
                        key={column.key}
                        name={column.key}
                        label={column.title}
                        getValueFromEvent={(id) => id}
                    >
                        <Select
                            options={statuses?.map(s => ({
                                value: s.id,
                                label: (
                                    <div>
                                        <div><strong>ID:</strong> {s.id}</div>
                                        <div><strong>Название:</strong> {s.name}</div>
                                        <div><strong>Описание:</strong> {s.description}</div>
                                    </div>
                                )
                            }))}
                            placeholder="Выберите статус"
                            style={{ width: '100%', height: 'auto' }}
                        />
                    </Form.Item>
                );
            }

            if (column.key === 'task') {
                return (
                    <Form.Item
                        key={column.key}
                        name={column.key}
                        label={column.title}
                        getValueFromEvent={(id) => id}
                    >
                        <Select
                            options={tasks?.map(t => ({
                                value: t.id,
                                label: (
                                    <div>
                                        <div><strong>ID:</strong> {t.id}</div>
                                        <div><strong>Тема:</strong> {t.subject}</div>
                                        <div><strong>Дата:</strong> {new Date(t.created_at).toLocaleString()}</div>
                                        <div><strong>Текст:</strong> {t.body}</div>
                                    </div>
                                )}))}
                            placeholder={`Выберите задачу`}
                            optionLabelProp="label"
                            style={{ width: '100%', height: 'auto' }}
                        />
                    </Form.Item>
                );
            }

            if (column.key === 'recipient_list') {
                return (
                    <Form.Item
                        key={column.key}
                        name={column.key}
                        label={column.title}
                    >
                        <Select
                            mode="multiple"
                            optionFilterProp="label"
                            options={recipients?.map(r => ({
                                value: r.id, // Сохраняем только ID в форме
                                label: r.address,
                                recipient: r // Сохраняем весь объект для доступа
                            }))}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                );
            }

            // Стандартные поля
            return (
                <Form.Item
                    key={column.key}
                    name={column.key}
                    label={column.title}
                    rules={[{ required: true, message: `Поле обязательно для заполнения` }]}
                >
                    <Input placeholder={`Введите ${column.title.toLowerCase()}`} />
                </Form.Item>
            );
        });
    };

    const items: MenuProps['items'] = [
        {
            label: 'Задачи',
            key: 'tasks',
        },
        {
            label: 'Сообщения',
            key: 'emails',
        },
        {
            label: 'Статусы',
            key: 'statuses',
        },
        {
            label: 'Пользователи',
            key: 'recipients',
        },
    ];

    const onClick: MenuProps['onClick'] = ({ key }) => {
        setActiveTable(key);
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

    return (
        <Layout>
            <header className="header">
                <Dropdown menu={{ items, onClick, style: { padding: '10px 20px' } }}>
                    <Button type="primary" onClick={(e) => e.preventDefault()} style={{
                        padding: '10px 20px',
                        height: 'auto',
                        fontSize: '20px'
                    }}>
                        <Space>
                            Справочники
                            <DownOutlined/>
                        </Space>
                    </Button>
                </Dropdown>
            </header>
            <div className="content">
                {currentTable ? (
                    <>
                        <h2>{currentTable.title}</h2>
                        <Flex gap="small" wrap>
                            <Button type="primary" onClick={() => showCreateModal()}>Добавить запись</Button>
                        </Flex>
                        <Table
                            dataSource={currentTable.data}
                            columns={currentTable.columns}
                            rowKey="id"
                            loading={isLoading}
                            onRow={(record: any) => ({
                                onDoubleClick: () => {
                                    setCurrentRecord(record);
                                    setIsModalVisible(true);
                                }
                            })}
                        />
                        <Modal
                            title={`Редактирование записи`}
                            open={isModalVisible}
                            onCancel={() => setIsModalVisible(false)}
                            destroyOnHidden={true}
                            footer={[
                                <Button danger key="delete" onClick={() => handleDelete()}>
                                    Удалить
                                </Button>,
                                <Button key="back" onClick={() => setIsModalVisible(false)}>
                                    Отмена
                                </Button>,
                                <Button key="submit" type="primary" onClick={() => form.submit()}>
                                    Сохранить
                                </Button>,
                            ]}
                        >
                            <Form
                                form={form}
                                onFinish={handleSubmit}
                                layout="vertical"
                            >
                                {renderFormFields()}
                            </Form>
                        </Modal>
                        <Modal
                            title={`Создание ${newItemType === 'status' ? 'статуса' : newItemType === 'task' ? 'задачи' : 'сообщения'}`}
                            open={isCreateModalVisible}
                            onCancel={() => setIsCreateModalVisible(false)}
                            onOk={handleCreate}
                        >
                            <Form form={createForm} layout="vertical">
                                {newItemType === 'recipient' && (
                                    <>
                                        <Form.Item name="address" label="Адрес">
                                            <Input.TextArea />
                                        </Form.Item>
                                    </>
                                )}

                                {newItemType === 'status' && (
                                    <>
                                        <Form.Item name="name" label="Название" rules={[{ required: true }]}>
                                            <Input />
                                        </Form.Item>
                                        <Form.Item name="description" label="Описание">
                                            <Input.TextArea />
                                        </Form.Item>
                                    </>
                                )}

                                {newItemType === 'task' && (
                                    <>
                                        <Form.Item name="subject" label="Тема" rules={[{ required: true }]}>
                                            <Input />
                                        </Form.Item>
                                        <Form.Item name="body" label="Содержание">
                                            <Input.TextArea />
                                        </Form.Item>
                                    </>
                                )}

                                {newItemType === 'email' && (
                                    <>
                                        <Form.Item name="status" label="ID статуса">
                                            <Select
                                                options={statuses?.map(s => ({
                                                    value: s.id,
                                                    label: (
                                                        <div>
                                                            <div><strong>ID:</strong> {s.id}</div>
                                                            <div><strong>Название:</strong> {s.name}</div>
                                                            <div><strong>Описание:</strong> {s.description}</div>
                                                        </div>
                                                    )
                                                }))}
                                                placeholder="Выберите статус"
                                                style={{ width: '100%', height: 'auto' }}
                                            />
                                        </Form.Item>
                                        <Form.Item name="task" label="ID задачи" rules={[{ required: true }]}>
                                            <Select
                                                options={tasks?.map(t => ({
                                                    value: t.id,
                                                    label: (
                                                        <div>
                                                            <div><strong>ID:</strong> {t.id}</div>
                                                            <div><strong>Тема:</strong> {t.subject}</div>
                                                            <div><strong>Дата:</strong> {new Date(t.created_at).toLocaleString()}</div>
                                                            <div><strong>Текст:</strong> {t.body}</div>
                                                        </div>
                                                    )}))}
                                                placeholder={`Выберите задачу`}
                                                optionLabelProp="label"
                                                style={{ width: '100%', height: 'auto' }}
                                            />
                                        </Form.Item>
                                        <Form.Item name="recipient_list" label="Получатели" rules={[{ required: true }]}>
                                            <Select
                                                mode="multiple"
                                                optionFilterProp="label"
                                                options={recipients?.map(r => ({
                                                    value: r.id, // Сохраняем только ID в форме
                                                    label: r.address,
                                                    recipient: r // Сохраняем весь объект для доступа
                                                }))}
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </>
                                )}
                            </Form>
                        </Modal>
                    </>
                ) : (
                    <div className="empty-state">
                        <Empty
                            description="Выберите справочник из меню выше"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </div>
                )}
            </div>
        </Layout>
    );
};