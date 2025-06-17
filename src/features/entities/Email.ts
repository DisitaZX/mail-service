import { Status } from './Status';
import { Task } from './Task';

export interface Email {
    id: number;
    send_at: number; // timestamp в миллисекундах
    status: Status | null;
    task: Task;
    recipient_list: string[];
}