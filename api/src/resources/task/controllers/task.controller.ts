import { Controller, Get, ParseEnumPipe, Query, UseGuards } from '@nestjs/common';
import { TaskService } from '../task.service';
import { AuthGuard } from '../../../auth/auth.guard';
import { TaskStatus } from '../task.consts';
import { TaskDto } from '../dto/task.dto';
import { Serialize } from '../../../serialization/serialize.decorator';

@UseGuards(AuthGuard)
@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Serialize(TaskDto)
    @Get()
    getStatus(@Query('status', new ParseEnumPipe(TaskStatus, { optional: true })) status?: TaskStatus) {
        return this.taskService.getAll(status);
    }
}
