import React, { useState } from 'react';
import { Layout, Table, Empty, Modal, Button, Form, Input, message, Flex } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Status, Task} from "../features/entities";
import 'antd/dist/reset.css';
import './styles/App.css';
import {
    useGetStatusesQuery,
    useUpdateStatusMutation,
    useCreateStatusMutation,
    useGetTasksQuery,
    useUpdateTaskMutation,
    useCreateTaskMutation,
    useGetEmailsQuery,
    useUpdateEmailMutation,
    useCreateEmailMutation
} from '../features/api';

interface TableConfig<T = any> {
    title: string;
    columns: ColumnsType<T>;
    data: T[];
}

export const App = () => {
    const [isOpen, setOpen] = useState(false);
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

    // Мутации для обновления данных
    const [updateStatus] = useUpdateStatusMutation();
    const [updateTask] = useUpdateTaskMutation();
    const [updateEmail] = useUpdateEmailMutation();

    // Мутации для создания данных
    const [createStatus] = useCreateStatusMutation();
    const [createTask] = useCreateTaskMutation();
    const [createEmail] = useCreateEmailMutation();


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
                                onPressEnter={() => confirm}
                                style={{ width: 188, marginBottom: 8, display: 'block' }}
                            />
                            <Button
                                type="primary"
                                onClick={() => confirm}
                                size="small"
                                style={{ width: 90 }}
                            >
                                Поиск
                            </Button>
                        </div>
                    )
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
                    key: 'recipients',
                    render: (recipients: string[]) => recipients.join(', ') || 'Нет получателей'
                },
            ],
            data: emails,
        },
    };

    const handleMenuItemClick = (tableName: string) => {
        setActiveTable(tableName);
        setOpen(false);
    };

    // Показ окна создания записи
    const showCreateModal = () => {
        if (activeTable === 'statuses') setNewItemType('status');
        if (activeTable === 'tasks') setNewItemType('task');
        if (activeTable === 'emails') setNewItemType('email');
        setIsCreateModalVisible(true);
        createForm.resetFields();
    };

    // Обработчик создания записи
    const handleCreate = async () => {
        try {
            const values = await createForm.validateFields();
            switch (newItemType) {
                case 'status':
                    await createStatus(values).unwrap();
                    message.success('Статус успешно создан');
                    break;
                case 'task':
                    await createTask(values).unwrap();
                    message.success('Задача успешно создана');
                    break;
                case 'email':
                    await createEmail({
                        status: {
                            id: values.id,
                            name: values.name,
                            description: values.description
                        },
                        task: {
                            id: values.id,
                            created_at: values.created_at,
                            subject: values.subject,
                            body: values.body
                        },
                        recipient_list: values.recipients || []
                    }).unwrap();
                    message.success('Сообщение успешно создано');
                    break;
            }

            setIsCreateModalVisible(false);
            createForm.resetFields();

            // Обновляем данные
            if (activeTable === 'statuses') refetchStatuses();
            if (activeTable === 'tasks') refetchTasks();
            if (activeTable === 'emails') refetchEmails();

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
                case 'statuses':
                    await updateStatus({ id: currentRecord.id, ...values }).unwrap();
                    break;
                case 'tasks':
                    await updateTask({ id: currentRecord.id, ...values }).unwrap();
                    break;
                case 'emails':
                    await updateEmail({ id: currentRecord.id, ...values }).unwrap();
                    break;
            }

            message.success('Данные успешно обновлены');
            setIsModalVisible(false);

            // Обновляем данные
            if (activeTable === 'statuses') refetchStatuses();
            if (activeTable === 'tasks') refetchTasks();
            if (activeTable === 'emails') refetchEmails();

        } catch (error) {
            message.error('Ошибка при обновлении данных');
            console.error('Update error:', error);
        }
    };

    const currentTable = activeTable ? tableConfigs[activeTable] : null;
    const isLoading = isStatusesLoading || isTasksLoading || isEmailsLoading;

    const renderFormFields = () => {
        if (!currentTable || !currentRecord) return null;

        return currentTable.columns.map((column: any) => {
            if (column.key === 'id') return null;

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

    return (
        <Layout>
            <header className="header">
                <Button type="primary" className="menu_button" onClick={() => setOpen(!isOpen)}>Справочники</Button>
                <nav className={`menu ${isOpen ? 'active' : ''}`}>
                    <ul className="menu_list">
                        <li className="menu_item" onClick={() => handleMenuItemClick('tasks')}>Задачи</li>
                        <li className="menu_item" onClick={() => handleMenuItemClick('emails')}>Сообщения</li>
                        <li className="menu_item" onClick={() => handleMenuItemClick('statuses')}>Статусы</li>
                    </ul>
                </nav>
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
                                    form.setFieldsValue(record);
                                }
                            })}
                        />
                        <Modal
                            title={`Редактирование записи`}
                            open={isModalVisible}
                            onCancel={() => setIsModalVisible(false)}
                            footer={[
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
                                        <Form.Item name="recipient" label="Получатель" rules={[{ required: true, type: 'email' }]}>
                                            <Input />
                                        </Form.Item>
                                        <Form.Item name="task_id" label="ID задачи" rules={[{ required: true }]}>
                                            <Input type="number" />
                                        </Form.Item>
                                        <Form.Item name="status_id" label="ID статуса">
                                            <Input type="number" />
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