import { Module } from '@nestjs/common';
import { ResourcesModule } from './resources/resources.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';

@Module({
    imports: [ResourcesModule, AuthModule, HealthModule],
})
export class AppModule {}
