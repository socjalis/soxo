import { Module, DynamicModule } from '@nestjs/common';
import { RateLimiterTopic } from './rate-limiter-topic';
import { RegisterTopicOptions } from './rate-limiter-module-options';

@Module({})
export class RateLimiterModule {
    static register(...options: RegisterTopicOptions[]): DynamicModule {
        const topicProviders = options.map((options) => {
            return {
                provide: options.name,
                useValue: new RateLimiterTopic(options),
            };
        });

        return {
            module: RateLimiterModule,
            providers: topicProviders,
            exports: topicProviders,
        };
    }
}
