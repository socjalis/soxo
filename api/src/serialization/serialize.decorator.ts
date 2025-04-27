import {
    applyDecorators,
    UseInterceptors,
    ClassSerializerInterceptor,
    Type,
    SerializeOptions,
} from '@nestjs/common';

export function Serialize(type: Type<any>) {
    return applyDecorators(UseInterceptors(ClassSerializerInterceptor), SerializeOptions({ type }));
}
