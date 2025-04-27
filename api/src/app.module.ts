import { Module } from '@nestjs/common';
import { EntityModule } from './resources/entity.module';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [EntityModule, AuthModule],
})
export class AppModule {}
