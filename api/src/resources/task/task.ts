import { TaskStatus } from './task.consts';

export class Task {
    id: string;
    userId: string;
    status: TaskStatus;
    createdAt: string;
    completedAt: string | null;
}
