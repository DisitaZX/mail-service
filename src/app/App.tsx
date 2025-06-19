import { Layout, Table, Empty, Modal, Button, Form, Input, Flex, MenuProps, Dropdown, Space, Select } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import './styles/App.css';
import { useTableData } from "./hooks/useTableData";
import { useHandlers } from "./hooks/useHandlers";
import { renderFormFields } from './renderForm/renderFormFields'


export const App = () => {
    const {
        statuses,
        tasks,
        recipients,
        isLoading,
    } = useTableData();

    const {
        showCreateModal,
        handleCreate,
        handleSubmit,
        handleDelete,
        setActiveTable,
        isModalVisible,
        setIsModalVisible,
        isCreateModalVisible,
        setIsCreateModalVisible,
        newItemType,
        createForm,
        form,
        currentRecord,
        setCurrentRecord,
        currentTable
    } = useHandlers();

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
                                {renderFormFields({currentTable, currentRecord, statuses, tasks, recipients})}
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