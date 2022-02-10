import { createRedisPayload } from '../intefraces/Environment.interface';
export class Environment {
  private static redisUrl(): string {
    return `redis://localhost:6379`;
  }

  static createRedisPayload(): createRedisPayload {
    return {
      url: this.redisUrl(),
    };
  }
}
