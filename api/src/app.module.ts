import { Module } from '@nestjs/common';
import { EntityModule } from './resources/entity.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';

@Module({
    imports: [EntityModule, AuthModule, HealthModule],
})
export class AppModule {}
