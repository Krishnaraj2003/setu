import { Injectable } from '@nestjs/common';
import { ServiceException } from 'src/utils/ServiceException';
import { RedisStore } from '../utils/RedisClient';

@Injectable()
export class TransactionService {
  private redisStore = RedisStore.getInstance();
  private error = new ServiceException();

  async createEqualSplit(
    group: string,
    user: string,
    name: string,
    amount: number,
  ): Promise<void> {
    const users = await this.redisStore.getUserPerGroup(group);
    if (!users) this.error.throwGroupNotExists(group);
    if (users[user] === null || users[user] === undefined)
      this.error.throwUserNotExists(user);
    const splitAmt = amount / Object.keys(users).length;
    const split = {};
    console.log(users);
    for (const u of Object.keys(users)) {
      if (u === user) {
        split[u] = amount - splitAmt;
      } else {
        split[u] = -1 * splitAmt;
        await Promise.all([
          this.redisStore.addAmount(group, u, user, split[u]),
          this.redisStore.addAmount(group, user, u, splitAmt),
        ]);
      }
      console.log(group, u, user, split[u]);
      await this.redisStore.editUser(group, u, users[u] + split[u]);
    }
    await this.redisStore.setTransaction(name, group, user, amount, split);
  }

  async settleUp(group: string, from: string, to: string): Promise<void> {
    console.log(from, to);
    const users = await this.redisStore.getUserPerGroup(group);
    if (!users) this.error.throwGroupNotExists(group);
    if (users[from] === null || users[from] === undefined)
      this.error.throwUserNotExists(from);
    if (users[to] === null || users[to] === undefined)
      this.error.throwUserNotExists(to);
    let amount: string | number | void = await this.redisStore.getAmount(
      group,
      from,
      to,
    );
    amount = parseFloat(amount);
    if (amount < 0) amount = -1 * amount;
    else amount = 0;
    const split = { [from]: -1 * amount, [to]: amount };
    await Promise.all([
      this.redisStore.addAmount(group, from, to, split[from]),
      this.redisStore.addAmount(group, to, from, split[to]),
      this.redisStore.editUser(group, from, users[from] + split[from]),
      this.redisStore.editUser(group, to, users[to] + split[to]),
      this.redisStore.setTransaction('Settle Up', group, from, amount, split),
    ]);
  }

  async getHistory(group: string) {
    return this.redisStore.getTransaction(group);
  }

  async createExactSplit(
    group: string,
    user: string,
    name: string,
    amount: number,
    split: { [key: string]: number },
  ): Promise<void> {
    const users = await this.redisStore.getUserPerGroup(group);
    if (!users) this.error.throwGroupNotExists(group);
    if (users[user] === null || users[user] === undefined)
      this.error.throwUserNotExists(user);

    let totalAmt = 0;
    for (const amt of Object.entries(split)) {
      totalAmt += amt[1];
    }
    if (amount !== totalAmt) this.error.throwAmountMismatch();
    const newSplit = {};
    for (const u of Object.keys(users)) {
      if (u === user) {
        newSplit[u] = split[u];
      } else {
        newSplit[u] = -1 * split[u];
        await Promise.all([
          this.redisStore.addAmount(group, u, user, newSplit[u]),
          this.redisStore.addAmount(group, user, u, split[u]),
        ]);
      }
      const addFact = u === user ? totalAmt - split[u] : newSplit[u];
      await this.redisStore.editUser(group, u, users[u] + addFact);
    }
    await this.redisStore.setTransaction(name, group, user, amount, newSplit);
  }
}
