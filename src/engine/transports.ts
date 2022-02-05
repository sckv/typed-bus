import LRUCache from 'lru-native2';

import { Event } from './event';

const cache = new LRUCache({ maxLoadFactor: 2, size: 2000, maxAge: 10000 });
export abstract class Transport {
  abstract name: string;

  lastEvent: Event | undefined;

  constructor() {
    if (typeof this.addConsumer !== 'function') {
      throw new Error(
        `Transport ${this.constructor.name} does not implement an addConsumer method.`,
      );
    }
  }

  async publish(event: Event): Promise<any> {
    if (cache.get(event.getUniqueStamp()) || this.lastEvent?.isAfter(event)) {
      console.error(
        `Next event to publish was produced before than the last published event or it's equal. Discarded`,
      );
      return;
    }

    if (typeof this._publish !== 'function') {
      throw new Error(`Transport ${this.constructor.name} does not implement a _publish method.`);
    }

    cache.set(event.getUniqueStamp(), true);

    await this._publish(event);
  }

  abstract addConsumer(contract: any, fn: () => any): void;
  abstract _publish(event: Event): Promise<any>;
}
