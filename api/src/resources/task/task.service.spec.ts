import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { TaskRepository } from './task.repository';
import { RateLimiterTopic } from '../../rate-limiter/rate-limiter-topic';
import { GLOBAL_TASK_LIMITER, TaskStatus, USER_TASK_LIMITER } from './task.consts';
import { BadRequestException, HttpException } from '@nestjs/common';
import { Task } from './task';
import { USERS } from '../user/user.service';

const userStub = USERS[0];

const taskStub: Task = {
    id: 'task1',
    userId: userStub.id,
    status: TaskStatus.PENDING,
    createdAt: new Date().toISOString(),
    completedAt: null,
};

describe('TaskService', () => {
    let taskService: TaskService;
    let taskRepository: jest.Mocked<TaskRepository>;
    let userLimiter: jest.Mocked<RateLimiterTopic>;
    let globalLimiter: jest.Mocked<RateLimiterTopic>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TaskService,
                {
                    provide: TaskRepository,
                    useValue: {
                        create: jest.fn(),
                        findBy: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: USER_TASK_LIMITER,
                    useValue: {
                        checkAndAdd: jest.fn(),
                        remove: jest.fn(),
                    },
                },
                {
                    provide: GLOBAL_TASK_LIMITER,
                    useValue: {
                        checkAndAdd: jest.fn(),
                        remove: jest.fn(),
                    },
                },
            ],
        }).compile();

        taskService = module.get<TaskService>(TaskService);
        taskRepository = module.get(TaskRepository);
        userLimiter = module.get('USER_TASK_LIMITER');
        globalLimiter = module.get('GLOBAL_TASK_LIMITER');
    });

    describe('create', () => {
        it('should create a task successfully', async () => {
            userLimiter.checkAndAdd.mockReturnValue('userCallId');
            globalLimiter.checkAndAdd.mockReturnValue('globalCallId');
            taskRepository.create.mockResolvedValue(taskStub);

            const result = await taskService.create(userStub);

            expect(result).toEqual(taskStub);
            expect(taskRepository.create).toHaveBeenCalledWith({
                userId: userStub.id,
                status: TaskStatus.PENDING,
                completedAt: null,
            });
        });

        it('should throw an exception if rate limit is exceeded', async () => {
            userLimiter.checkAndAdd.mockReturnValue(false);
            globalLimiter.checkAndAdd.mockReturnValue('globalCallId');

            await expect(taskService.create(userStub)).rejects.toThrow(HttpException);
        });

        it('should rollback calls if task creation fails', async () => {
            userLimiter.checkAndAdd.mockReturnValue('userCallId');
            globalLimiter.checkAndAdd.mockReturnValue('globalCallId');
            taskRepository.create.mockRejectedValue(new Error('Database error'));

            await expect(taskService.create(userStub)).rejects.toThrow('Database error');

            expect(userLimiter.remove).toHaveBeenCalledWith('userCallId', userStub.id);
            expect(globalLimiter.remove).toHaveBeenCalledWith('globalCallId');
        });
    });

    describe('getAll', () => {
        it('should return all tasks', () => {
            const tasks = [taskStub];
            taskRepository.findBy.mockReturnValue(tasks);

            const result = taskService.getAll();

            expect(result).toEqual(tasks);
            expect(taskRepository.findBy).toHaveBeenCalledWith({});
        });

        it('should return tasks filtered by status', () => {
            const tasks = [taskStub];
            taskRepository.findBy.mockReturnValue(tasks);

            const result = taskService.getAll(TaskStatus.PENDING);

            expect(result).toEqual(tasks);
            expect(taskRepository.findBy).toHaveBeenCalledWith({ status: TaskStatus.PENDING });
        });
    });

    describe('getByUser', () => {
        it('should return tasks for a specific user', () => {
            const tasks = [taskStub];
            taskRepository.findBy.mockReturnValue(tasks);

            const result = taskService.getByUser(userStub);

            expect(result).toEqual(tasks);
            expect(taskRepository.findBy).toHaveBeenCalledWith({ userId: userStub.id });
        });

        it('should return tasks for a specific user filtered by status', () => {
            const tasks = [taskStub];
            taskRepository.findBy.mockReturnValue(tasks);

            const result = taskService.getByUser(userStub, TaskStatus.PENDING);

            expect(result).toEqual(tasks);
            expect(taskRepository.findBy).toHaveBeenCalledWith({
                userId: userStub.id,
                status: TaskStatus.PENDING,
            });
        });
    });

    describe('complete', () => {
        it('should complete a task successfully', () => {
            const updatedTask = {
                ...taskStub,
                status: TaskStatus.COMPLETED,
                completedAt: new Date().toISOString(),
            };
            taskRepository.findBy.mockReturnValue([taskStub]);
            taskRepository.update.mockReturnValue(updatedTask);

            const result = taskService.complete('task1', userStub);

            expect(result).toEqual(updatedTask);
            expect(taskRepository.update).toHaveBeenCalledWith('task1', {
                status: TaskStatus.COMPLETED,
                completedAt: expect.any(String) as unknown,
            });
        });

        it('should throw an exception if task does not exist', () => {
            taskRepository.findBy.mockReturnValue([]);

            expect(() => taskService.complete('nonexistentTaskId', userStub)).toThrow(BadRequestException);
        });

        it('should throw an exception if task is already completed', () => {
            taskRepository.findBy.mockReturnValue([
                {
                    ...taskStub,
                    status: TaskStatus.COMPLETED,
                },
            ]);

            expect(() => taskService.complete('taskId', userStub)).toThrow(BadRequestException);
        });
    });
});
