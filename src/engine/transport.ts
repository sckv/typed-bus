import LRUCache from 'lru-native2';
import * as iots from 'io-ts';
import { isLeft } from 'fp-ts/lib/Either';

import { Event } from './event';

import { EventBaseType } from '../validation/event-base-type';
import { reporter } from '../validation/reporter';

export type MatchEvent = (event: Event) => 'ok' | { [k: string]: string };
export type ConsumerMethod = {
  contract: iots.Any;
  exec: (...args: any[]) => any;
  matchEvent: MatchEvent;
};

const cache = new LRUCache({ maxLoadFactor: 2, size: 10000, maxAge: 10000 });

export abstract class Transport {
  abstract name: string;
  consumers: ConsumerMethod[] = [];
  ready = false;
  waitForReady = true;

  lastEvent: Event | undefined;

  constructor() {
    if (typeof this.addConsumer !== 'function') {
      throw new Error(
        `Transport ${this.constructor.name} does not implement an addConsumer method.`,
      );
    }

    this.startAsyncTransport()
      .then(() => (this.ready = true))
      .catch(console.error);
  }

  async publish(event: Event): Promise<{
    orphanEvent?: boolean;
    transport: string;
    publishedConsumers: PromiseSettledResult<void>[];
  } | null> {
    if (!this.ready) await this.waitForTransportReadiness();

    if (cache.get(event.getUniqueStamp()) || this.lastEvent?.isAfter(event)) {
      console.error(
        `Next event to publish was produced before than the last published event or it's equal. Discarded`,
      );
      return null;
    }

    if (typeof this._publish !== 'function') {
      throw new Error(`Transport ${this.constructor.name} does not implement a _publish method.`);
    }

    cache.set(event.getUniqueStamp(), true);

    return {
      ...(await this._publish(event)),
      transport: this.name,
    };
  }

  async waitForTransportReadiness() {
    if (!this.ready && !this.waitForReady) {
      console.error(
        `Transport ${this.constructor.name} is not ready yet, please wait for it to be ready before publishing.`,
      );
      return {
        publishedConsumers: [],
        orphanEvent: false,
        transport: this.name,
      };
    }

    if (!this.ready && this.waitForReady) {
      console.log('Wait for transport to be ready before publishing...');
      await new Promise<void>((res) => {
        setTimeout(() => {
          if (this.ready) res();
        }, 1000);
      });
    }
  }

  addConsumer(contract: iots.Any, fn: () => any): void {
    const contractIntersection = iots.intersection([
      iots.type({ payload: contract }),
      EventBaseType,
    ]);

    const matchEvent: MatchEvent = (event: Event) => {
      const decode = contractIntersection.decode(event);
      if (isLeft(decode)) {
        return reporter(decode);
      }
      return true;
    };

    this.consumers.push({ contract, exec: fn, matchEvent });
  }

  async startAsyncTransport() {
    if (typeof this._startAsyncTransport === 'function') await this._startAsyncTransport();
  }

  abstract _startAsyncTransport?(): Promise<void>;
  abstract _publish(event: Event): Promise<{
    orphanEvent?: boolean;
    publishedConsumers: PromiseSettledResult<void>[];
  }>;
}
