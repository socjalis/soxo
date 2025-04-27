import { Injectable } from '@nestjs/common';
import { Task } from './task';

@Injectable()
export class TaskRepository {
    private readonly tasks: Map<string, Task> = new Map();

    async create(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
        const newTask: Task = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            userId: task.userId,
            status: task.status,
            completedAt: task.completedAt,
        };

        // simulating I/O
        await new Promise((res) => setTimeout(() => res(true), 0));

        this.tasks.set(newTask.id, newTask);

        return newTask;
    }

    findAll(): Task[] {
        return Array.from(this.tasks.values());
    }

    findById(id: string): Task | undefined {
        return this.tasks.get(id);
    }

    findBy(filter: Partial<Task>): Task[] {
        return Array.from(this.tasks.values()).filter((task) =>
            Object.entries(filter).every(([key, value]) => task[key as keyof Task] === value),
        );
    }

    update(id: string, updatedTask: Partial<Task>): Task | undefined {
        const existingTask = this.tasks.get(id);
        if (!existingTask) {
            throw Error(`Task with id ${id} not found`);
        }
        const updated = { ...existingTask, ...updatedTask };
        this.tasks.set(id, updated);

        return updated;
    }

    delete(id: string): boolean {
        return this.tasks.delete(id);
    }
}
