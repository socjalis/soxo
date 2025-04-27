import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Task } from './task';
import { GLOBAL_TASK_LIMITER, TaskStatus, USER_TASK_LIMITER } from './task.consts';
import { TaskRepository } from './task.repository';
import { User } from '../user/user';
import { RateLimiterTopic } from '../../rate-limiter/rate-limiter-topic';

@Injectable()
export class TaskService {
    constructor(
        private readonly taskRepository: TaskRepository,
        @Inject(USER_TASK_LIMITER)
        private readonly userLimiter: RateLimiterTopic,
        @Inject(GLOBAL_TASK_LIMITER)
        private readonly globalLimiter: RateLimiterTopic,
    ) {}

    async create(user: User): Promise<Task> {
        /* 
        with more time I would probably create method decorators like @UserLimiter(),
        which would get the current user from AsyncLocalStorage and encapsulate the rate limiting logic,
        but more verbose solution is also fine
        */
        const { isExceeded, callIds } = this.checkAndIncrementCallLimit(user);

        if (isExceeded) {
            this.rollbackCalls(user, callIds);
            throw new HttpException('Limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
        }

        try {
            const task = await this.taskRepository.create({
                userId: user.id,
                status: TaskStatus.PENDING,
                completedAt: null,
            });

            return task;
        } catch (error: unknown) {
            // rolling back changes, so the user won't lose their limit or be charged for a failed request
            this.rollbackCalls(user, callIds);

            throw error;
        }
    }

    getAll(status?: TaskStatus): Task[] {
        const filter = status ? { status } : {};

        return this.taskRepository.findBy(filter);
    }

    getByUser(user: User, status?: TaskStatus): Task[] {
        const filter = status ? { status } : {};

        return this.taskRepository.findBy({ ...filter, userId: user.id });
    }

    complete(taskId: string, user: User): Task {
        const task = this.taskRepository.findBy({ id: taskId, userId: user.id })[0];
        if (!task) {
            throw new BadRequestException(`Can't complete nonexistent task`);
        }

        if (task.status === TaskStatus.COMPLETED) {
            throw new BadRequestException(`Can't complete completed task`);
        }

        const updatedTask = this.taskRepository.update(taskId, {
            status: TaskStatus.COMPLETED,
            completedAt: new Date().toISOString(),
        })!;

        return updatedTask;
    }

    checkAndIncrementCallLimit(user: User) {
        const userCallId = this.userLimiter.checkAndAdd(user.id);
        const globalCallId = this.globalLimiter.checkAndAdd();

        return { isExceeded: !userCallId || !globalCallId, callIds: { userCallId, globalCallId } };
    }

    rollbackCalls(user: User, callIds: { userCallId: string | false; globalCallId: string | false }) {
        if (callIds.userCallId) {
            this.userLimiter.remove(callIds.userCallId, user.id);
        }
        if (callIds.globalCallId) {
            this.globalLimiter.remove(callIds.globalCallId);
        }
    }
}
