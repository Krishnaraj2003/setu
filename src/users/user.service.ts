import { Injectable } from '@nestjs/common';
import { JWT } from '../utils/jwt';
import { RedisStore } from '../utils/RedisClient';
import { ServiceException } from '../utils/ServiceException';
@Injectable()
export class UserService {
  private redisStore = RedisStore.getInstance();
  private error = new ServiceException();

  async getToken(user: string, pass: string): Promise<string> {
    const exists = await this.redisStore.checkUser(user, pass);
    if (!exists) {
      this.error.throwInvalidCreds();
    }
    return JWT.sign(user);
  }

  async createUser(user: string, pass: string): Promise<void> {
    await this.redisStore.saveUser(user, pass);
  }

  async getGroups(user: string): Promise<string[]> {
    const groups = await this.redisStore.getGroupPerUser(user);
    if (!groups) return [];
    return groups;
  }
}
