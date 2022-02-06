import LRUCache from 'lru-native2';
import * as iots from 'io-ts';

import { Event } from './event';

import { EventBaseType } from '../validation/event-base-type';

export type Consumer = { contract: iots.Any; fn: (...args: any[]) => any };

const cache = new LRUCache({ maxLoadFactor: 2, size: 10000, maxAge: 10000 });

export abstract class Transport {
  abstract name: string;
  abstract consumers: Consumer[];
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

    const { orphanEvents } = await this._publish(event);
    if (orphanEvents.length) {
      console.error(
        `${orphanEvents.length} orphan events were produced after publishing to transport ${this.name}`,
      );
    }
  }

  addConsumer(contract: iots.Any, fn: () => any) {
    const contractIntersection = iots.intersection([
      iots.type({ payload: contract }),
      EventBaseType,
    ]);

    this.consumers.push({ contract: contractIntersection, fn });
  }

  abstract _publish(event: Event): Promise<{
    orphanEvents: Event[];
    publishedEvents: PromiseSettledResult<void>[];
  }>;
}
