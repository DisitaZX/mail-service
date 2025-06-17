import React, { useState } from 'react';
import { Layout, Table, Empty, Modal, Button, Form, Input, message, Flex, MenuProps, Dropdown, Space, Select } from 'antd';
import { SearchOutlined, DownOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Status, Task, Recipient } from "../features/entities";
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
    useCreateEmailMutation,
    useGetRecipientsQuery,
    useUpdateRecipientMutation,
    useCreateRecipientMutation
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
            if (activeTable === 'recipients') refetchRecipients(); // Может понадобиться

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
                    await updateEmail({ id: currentRecord.id, ...values }).unwrap();
                    break;
            }

            message.success('Данные успешно обновлены');
            setIsModalVisible(false);

            // Обновляем данные
            if (activeTable === 'statuses') refetchStatuses();
            if (activeTable === 'tasks') refetchTasks();
            if (activeTable === 'emails') refetchEmails();
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

            const fieldValue = currentRecord[column.key];

            if (column.key === 'status') {
                return (
                    <Form.Item
                        key={column.key}
                        label={column.title}
                    >
                        <Select
                            options={statuses?.map(s => ({ value: s.id, label: s.name }))}
                            placeholder={`Выберите ${column.title.toLowerCase()}`}
                            value={fieldValue?.id}
                        />
                    </Form.Item>
                );
            }

            if (column.key === 'task') {
                return (
                    <Form.Item
                        key={column.key}
                        label={column.title}
                    >
                        <Select
                            options={tasks?.map(t => ({value: t.id, label: t.subject}))}
                            placeholder={`Выберите ${column.title.toLowerCase()}`}
                            value={fieldValue?.id}
                        />
                    </Form.Item>
                );
            }

            // Обработка массивов (recipient_list)
            if (Array.isArray(fieldValue)) {
                return (
                    <Form.Item label={column.title}>
                        <Form.List name={column.key} >
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'address']}
                                                rules={[{ required: true, message: 'Введите email' }]}
                                            >
                                                <Input placeholder="Email получателя" />
                                            </Form.Item>
                                            <MinusCircleOutlined onClick={() => remove(name)} />
                                        </Space>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add({ address: '' })} block icon={<PlusOutlined />}>
                                            Добавить получателя
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
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