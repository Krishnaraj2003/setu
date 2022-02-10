import { createClient } from 'redis';
import { Environment } from './Environment';
import {
  USERPREFIX,
  GROUPPREFIX,
  USERGROUPPREFIX,
  TRANSACTION,
  USERINDIVEDUAL,
} from './Constants';

class RedisClient {
  private client;
  async createClient() {
    this.client = createClient(Environment.createRedisPayload());

    this.client.on('error', (err) => {
      console.log('Redis Client Error', err);
      setTimeout(() => {
        this.createClient();
      }, 2000);
    });

    await this.client.connect();
  }

  async set(key: string, value: string | number): Promise<string> {
    return await this.client.set(key, value);
  }

  async get(key: string): Promise<string> {
    return await this.client.get(key);
  }

  async setJson(key: string, root: string, dict: any): Promise<void> {
    await this.client.json.set(key, root, dict);
  }

  async getJson(key: string, root: string): Promise<any> {
    return await this.client.json.get(key, root);
  }

  async setArray(key: string, root: string, dict: any): Promise<void> {
    await this.client.json.ARRAPPEND(key, root, dict);
  }

  async getArray(key: string): Promise<string[]> {
    return await this.client.json.GET(key);
  }
}

export class RedisStore {
  private client: RedisClient = new RedisClient();
  private static _instance: RedisStore = new RedisStore();
  constructor() {
    if (RedisStore._instance) {
      throw new Error(
        'Error: Instantiation failed: Use SingletonClass.getInstance() instead of new.',
      );
    }
    RedisStore._instance = this;
  }

  public static getInstance(): RedisStore {
    return RedisStore._instance;
  }

  async initialize(): Promise<void> {
    await this.client.createClient();
  }

  async saveUser(userName: string, password: string) {
    await this.client.set(USERPREFIX + userName, password);
  }

  async checkUser(userName: string, password: string): Promise<boolean> {
    const pass = await this.client.get(USERPREFIX + userName);
    if (!pass || pass !== password) return false;
    return true;
  }

  async checkUserExists(userName: string): Promise<boolean> {
    const pass = await this.client.get(USERPREFIX + userName);
    if (!pass) return false;
    return true;
  }

  async createUserPerGroup(group: string, userList: string[]): Promise<void> {
    const userDict = {};
    for (const u of userList) {
      userDict[u] = 0;
      const checkExist = await this.getGroupPerUser(u);
      if (!checkExist) {
        await this.client.setJson(USERGROUPPREFIX + u, '.', []);
      }
      await this.client.setArray(USERGROUPPREFIX + u, '.', group);
    }
    await this.client.setJson(GROUPPREFIX + group, '.', userDict);
  }

  async getUserPerGroup(group: string): Promise<any> {
    return await this.client.getJson(GROUPPREFIX + group, '.');
  }

  async getGroupPerUser(name: string): Promise<any> {
    return await this.client.getArray(USERGROUPPREFIX + name);
  }

  async setTransaction(
    name: string,
    group: string,
    paidBy: string,
    amount: number,
    split: any,
  ): Promise<void> {
    const checkExist = await this.client.getArray(TRANSACTION + group);
    if (!checkExist) {
      await this.client.setJson(TRANSACTION + group, '.', []);
    }
    await this.client.setArray(TRANSACTION + group, '.', {
      name,
      paidBy,
      amount,
      split,
      ts: +new Date(),
    });
  }

  async getTransaction(group: string): Promise<any> {
    return await this.client.getArray(TRANSACTION + group);
  }

  async editUser(group: string, user: string, amount: number): Promise<void> {
    await this.client.setJson(GROUPPREFIX + group, '.' + user, amount);
  }

  async addAmount(
    group: string,
    from: string,
    to: string,
    amount: number,
  ): Promise<void> {
    const key = this.getKey(group, from, to);
    const amt = await this.getAmount(group, from, to);
    if (!amt) {
      await this.client.set(key, amount);
      return;
    }
    await this.client.set(key, amount + parseFloat(amt));
  }

  async getAmount(
    group: string,
    from: string,
    to: string,
  ): Promise<string | null> {
    const key = this.getKey(group, from, to);
    return await this.client.get(key);
  }

  private getKey(group, from, to): string {
    return USERINDIVEDUAL + '_' + group + '_' + from + '_' + to;
  }
}
