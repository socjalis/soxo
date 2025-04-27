import { RateLimiterTopic } from './rate-limiter-topic';

const uuidStub = 'e8ed147d-4c31-487e-a3a0-b0c9e509a2f9';

describe('RateLimiterTopic', () => {
    const options = { name: 'test', ttl: 60, maxAllowed: 3 };
    let rateLimiter: RateLimiterTopic;

    beforeEach(() => {
        rateLimiter = new RateLimiterTopic(options);
    });

    it('should allow a call if under the limit', () => {
        jest.spyOn(crypto, 'randomUUID').mockReturnValue(uuidStub);
        const result = rateLimiter.checkAndAdd('user');

        expect(result).toBe(uuidStub);
    });

    it('should block a call if over the limit', () => {
        rateLimiter.checkAndAdd('user');
        rateLimiter.checkAndAdd('user');
        rateLimiter.checkAndAdd('user');

        const result = rateLimiter.checkAndAdd('user');

        expect(result).toBe(false);
    });

    it('should remove a call by ID', () => {
        jest.spyOn(crypto, 'randomUUID').mockReturnValue(uuidStub);
        rateLimiter.checkAndAdd('user');
        rateLimiter.checkAndAdd('user');
        const callId = rateLimiter.checkAndAdd('user');

        rateLimiter.remove(callId as string, 'user');
        const result = rateLimiter.checkAndAdd('user');

        expect(result).toBe(uuidStub);
    });

    it('should remove a call by ID with a default identifier', () => {
        jest.spyOn(crypto, 'randomUUID').mockReturnValue(uuidStub);
        rateLimiter.checkAndAdd();
        rateLimiter.checkAndAdd();
        const callId = rateLimiter.checkAndAdd();

        rateLimiter.remove(callId as string);
        const result = rateLimiter.checkAndAdd();

        expect(result).toBe(uuidStub);
    });

    it('should not throw an error if removing a call from nonexistent identifier', () => {
        expect(() => rateLimiter.remove('nonexistent identifier', 'user')).not.toThrow();
    });

    it('should respect TTL', () => {
        jest.useFakeTimers();

        jest.spyOn(crypto, 'randomUUID').mockReturnValue(uuidStub);
        rateLimiter.checkAndAdd('user');
        rateLimiter.checkAndAdd('user');
        rateLimiter.checkAndAdd('user');

        jest.advanceTimersByTime(options.ttl * 1000 + 1);

        const result = rateLimiter.checkAndAdd('user');

        expect(result).toBe(uuidStub);
        jest.useRealTimers();
    });

    it('should handle default identifier if none is provided', () => {
        const result1 = rateLimiter.checkAndAdd();
        const result2 = rateLimiter.checkAndAdd();
        const result3 = rateLimiter.checkAndAdd();
        const result4 = rateLimiter.checkAndAdd();

        expect(result1).toBeTruthy();
        expect(result2).toBeTruthy();
        expect(result3).toBeTruthy();
        expect(result4).toBe(false);
    });
});
