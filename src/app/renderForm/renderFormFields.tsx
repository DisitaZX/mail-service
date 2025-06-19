import {Form, Input, Select} from "antd";
import { Status, Task, Recipient } from '../../features/entities';
import { TableConfig } from '../tableConfigs/tableConfig'

interface RenderFormFieldsProps {
    currentTable: TableConfig<any> | null;
    currentRecord: any;
    statuses: Status[];
    tasks: Task[];
    recipients: Recipient[];
}

export const renderFormFields = ({
                              currentTable,
                              currentRecord,
                              statuses,
                              tasks,
                              recipients
                          }: RenderFormFieldsProps) => {

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
                        style={{width: '100%', height: 'auto'}}
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
                            )
                        }))}
                        placeholder={`Выберите задачу`}
                        optionLabelProp="label"
                        style={{width: '100%', height: 'auto'}}
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
                        style={{width: '100%'}}
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
                rules={[{required: true, message: `Поле обязательно для заполнения`}]}
            >
                <Input placeholder={`Введите ${column.title.toLowerCase()}`}/>
            </Form.Item>
        );
    });
};