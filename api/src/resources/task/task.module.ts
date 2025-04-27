import { Module } from '@nestjs/common';
import { UserTaskController } from './controllers/user-task.controller';
import { TaskService } from './task.service';
import { TaskController } from './controllers/task.controller';
import { RateLimiterModule } from '../../rate-limiter/rate-limiter.module';
import { GLOBAL_TASK_LIMITER, USER_TASK_LIMITER } from './task.consts';
import { TaskRepository } from './task.repository';

@Module({
    imports: [
        RateLimiterModule.register(
            {
                name: USER_TASK_LIMITER,
                maxAllowed: 5,
                ttl: 60,
            },
            {
                name: GLOBAL_TASK_LIMITER,
                maxAllowed: 20,
                ttl: 60 * 5,
            },
        ),
    ],
    controllers: [UserTaskController, TaskController],
    providers: [TaskService, TaskRepository],
    exports: [TaskService],
})
export class TaskModule {}
