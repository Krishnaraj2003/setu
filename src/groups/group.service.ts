import { Injectable } from '@nestjs/common';
import { RedisStore } from '../utils/RedisClient';
import { ServiceException } from '../utils/ServiceException';

@Injectable()
export class GroupService {
  private redisStore = RedisStore.getInstance();
  private error = new ServiceException();

  async createGroup(name: string, members: string[]): Promise<void> {
    const exists = await this.redisStore.getUserPerGroup(name);
    if (exists) this.error.throwGroupExists();
    for (const u of members) {
      const userExists = await this.redisStore.checkUserExists(u);
      if (!userExists) this.error.throwUserNotExists(u);
    }
    await this.redisStore.createUserPerGroup(name, members);
  }

  async getMemebers(name: string): Promise<string[]> {
    const userJson = await this.redisStore.getUserPerGroup(name);
    if (!userJson) this.error.throwGroupNotExists(name);
    const returnList = [];
    for (const usr of Object.keys(userJson)) {
      returnList.push(usr);
    }
    return returnList;
  }

  async getSplits(name: string): Promise<any> {
    const users = await this.redisStore.getUserPerGroup(name);
    if (!users) this.error.throwGroupNotExists(name);
    return users;
  }
}
