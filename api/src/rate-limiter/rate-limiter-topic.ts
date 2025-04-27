import { RegisterTopicOptions } from './rate-limiter-module-options';

interface Call {
    id: string;
    date: Date;
}

const DEFAULT_IDENTIFIER = true;

// It could also be an Injectable, but it would require injecting options for all topics.
export class RateLimiterTopic {
    private readonly ttl: number;
    private readonly maxAllowed: number;

    // Redis would be a good choice to implement this feature more seriously
    // https://redis.io/docs/latest/commands/incr/
    private readonly callsMap: Map<unknown, Call[]> = new Map();

    constructor(options: RegisterTopicOptions) {
        this.ttl = options.ttl;
        this.maxAllowed = options.maxAllowed;
    }

    checkAndAdd(identifier: unknown = DEFAULT_IDENTIFIER): string | false {
        const now = new Date();
        const calls = this.callsMap.get(identifier) || [];

        const filteredCalls = calls.filter((call) => {
            return now.getTime() - call.date.getTime() <= this.ttl * 1000;
        });

        this.callsMap.set(identifier, filteredCalls);

        if (filteredCalls.length >= this.maxAllowed) {
            return false;
        }

        return this.pushNewCall(filteredCalls);
    }

    private pushNewCall(calls: Call[]): string {
        const id = crypto.randomUUID();

        calls.push({ id, date: new Date() });

        return id;
    }

    remove(callId: string, identifier: unknown = DEFAULT_IDENTIFIER) {
        const calls = this.callsMap.get(identifier) || [];

        const filteredCalls = calls.filter((call) => {
            return call.id !== callId;
        });

        this.callsMap.set(identifier, filteredCalls);
    }
}
