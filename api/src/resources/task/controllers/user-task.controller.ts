import {
    Controller,
    Get,
    HttpCode,
    Param,
    ParseEnumPipe,
    ParseUUIDPipe,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { TaskService } from '../task.service';
import { AuthGuard } from '../../../auth/auth.guard';
import { TaskStatus } from '../task.consts';
import { User } from '../../user/user';
import { HttpUser } from '../../../utilities/decorators/http-user.decorator';
import { Serialize } from '../../../serialization/serialize.decorator';
import { TaskDto } from '../dto/task.dto';

@UseGuards(AuthGuard)
@Controller('me/tasks')
export class UserTaskController {
    constructor(private readonly taskService: TaskService) {}

    @Serialize(TaskDto)
    @Get()
    getStatus(
        @HttpUser() user: User,
        @Query('status', new ParseEnumPipe(TaskStatus, { optional: true })) status?: TaskStatus,
    ) {
        return this.taskService.getByUser(user, status);
    }

    @Serialize(TaskDto)
    @Post()
    create(@HttpUser() user: User) {
        return this.taskService.create(user);
    }

    @Serialize(TaskDto)
    @Post(':id/Complete')
    @HttpCode(200)
    complete(@Param('id', ParseUUIDPipe) taskId: string, @HttpUser() user: User) {
        return this.taskService.complete(taskId, user);
    }
}
