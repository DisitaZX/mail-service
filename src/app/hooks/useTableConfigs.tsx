import {Button, Input} from "antd";
import {SearchOutlined} from "@ant-design/icons";
import {Recipient, Status, Task} from "@features/entities";
import React from "react";
import { useTableData } from "./useTableData";
import { TableConfig } from "../tableConfigs/tableConfig"

export const useTableConfigs = () => {
    const {
        statuses,
        tasks,
        emails,
        recipients,
    } = useTableData();

    const tableConfigs: Record<string, TableConfig> = {
        statuses: {
            title: 'Статусы',
            columns: [
                {title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id},
                {title: 'Название', dataIndex: 'name', key: 'name'},
                {title: 'Описание', dataIndex: 'description', key: 'description'},
            ],
            data: statuses,
        },
        tasks: {
            title: 'Задачи',
            columns: [
                {title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id},
                {
                    title: 'Тема',
                    dataIndex: 'subject',
                    key: 'subject',
                    filterDropdown: ({setSelectedKeys, selectedKeys, confirm}) => (
                        <div style={{padding: 8}}>
                            <Input
                                placeholder="Поиск по теме"
                                value={selectedKeys[0]}
                                onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                                onPressEnter={() => confirm()}
                                style={{width: 188, marginBottom: 8, display: 'block'}}
                            />
                            <Button
                                type="primary"
                                onClick={() => confirm()}
                                size="small"
                                style={{width: 90}}
                            >
                                Поиск
                            </Button>
                        </div>
                    ),
                    onFilter: (value, record) =>
                        record.subject.toLowerCase().includes(value.toString().toLowerCase()),
                    filterIcon: filtered => (
                        <SearchOutlined style={{color: filtered ? '#1890ff' : undefined}}/>
                    ),
                },
                {title: 'Содержание', dataIndex: 'body', key: 'body'},
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
                {title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id},
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
                {title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id},
                {title: 'Адрес', dataIndex: 'address', key: 'address'},
            ],
            data: recipients,
        }
    };

    return {
        tableConfigs,
    }
}