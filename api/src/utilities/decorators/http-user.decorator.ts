import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../resources/user/user';

export const HttpUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: User }>();

    return request.user;
});
