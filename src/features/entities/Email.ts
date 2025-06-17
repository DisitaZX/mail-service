import { Status } from './Status';
import { Task } from './Task';
import { Recipient } from './Recipient';

export interface Email {
    id: number;
    send_at: number; // timestamp в миллисекундах
    status: Status | null;
    task: Task;
    recipient_list: Recipient[];
}