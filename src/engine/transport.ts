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
  id: string;
};

const cache = new LRUCache({ maxLoadFactor: 2, size: 10000, maxAge: 10000 });

export abstract class Transport {
  abstract name: string;
  consumers: ConsumerMethod[] = [];
  ready = false;
  waitForReady = true;
  lastEvent: Event | undefined;

  constructor() {
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

    cache.set(event.getUniqueStamp(), true);

    this.lastEvent = event;

    if (typeof this._publish === 'function') {
      return {
        ...(await this._publish(event)),
        transport: this.name,
      };
    }

    const publishedConsumers: any[] = [];

    for (const consumer of this.consumers) {
      const okOrError = consumer.matchEvent(event);
      if (okOrError === 'ok') {
        publishedConsumers.push(consumer.exec(event.payload));
      } else {
        if (Object.keys(okOrError).length < 2) {
          console.log(okOrError);
          console.log(
            `Event just have 1 error, maybe there's a malformed object for a consumer ${consumer.exec.name} with type ${consumer.contract.name}`,
          );
        }
      }
    }

    return {
      transport: this.name,
      orphanEvent: publishedConsumers.length === 0 ? true : false,
      publishedConsumers: await Promise.allSettled(publishedConsumers),
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

  addConsumer(contract: iots.Any, fn: () => any, consumerId: string, hookId?: string): void {
    if (this.consumers.findIndex(({ exec }) => exec === fn) !== -1) {
      console.log(
        'Cant add a consumer to a transport that already has one with the same reference',
      );
      return;
    }

    const contractIntersection = iots.intersection([
      iots.type({ payload: contract }),
      EventBaseType,
      iots.type({ hookId: hookId ? iots.literal(hookId) : iots.unknown }),
    ]);

    const matchEvent: MatchEvent = (event: Event) => {
      const decode = contractIntersection.decode(event);
      if (isLeft(decode)) {
        return reporter(decode);
      }
      return 'ok';
    };

    this.consumers.push({ contract, exec: fn, matchEvent, id: consumerId });
  }

  removeConsumer(consumerId: string) {
    if (typeof consumerId !== 'string') {
      throw new Error('Consumer id must be a string to remove');
    }

    this.consumers = this.consumers.filter(({ id }) => id !== consumerId);
  }

  async startAsyncTransport() {
    if (!this.ready && typeof this._startAsyncTransport === 'function')
      await this._startAsyncTransport();
  }

  _startAsyncTransport?(): Promise<void>;
  _publish?(event: Event): Promise<{
    orphanEvent?: boolean;
    publishedConsumers: PromiseSettledResult<void>[];
  }>;
}
