import LRUCache from 'lru-cache';
import * as iots from 'io-ts';
import { isLeft } from 'fp-ts/lib/Either';
import hyperid from 'hyperid';

import { Event } from './event';
import { transportAsyncStorage } from './typed-bus';

import { EventBaseType } from '../validation/event-base-type';
import { reporter } from '../validation/reporter';

export type MatchEvent = (event: Event) => 'ok' | { [k: string]: string };
export type ConsumerSignature = {
  loc: string;
  contract: iots.Any;
  exec: (...args: any[]) => any;
  matchEvent: MatchEvent;
  id: string;
};

export type PublishedConsumer = {
  exec: any;
};

const cache = new LRUCache({ max: 10000, ttl: 10000 });

export abstract class Transport {
  abstract name: string;

  consumers: ConsumerSignature[] = [];
  ready = true;
  waitForReady = false;
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

    console.log({ last: this.lastEvent, event });
    if (this.lastEvent?.isAfter(event)) {
      console.error(
        `Next event to publish was produced before than the last published event or it's equal. Discarded`,
      );
      return null;
    }
    this.lastEvent = event;

    if (typeof this._publish === 'function') {
      this.lastEvent = event;
      return {
        ...(await this._publish(event)),
        transport: this.name,
      };
    }

    const publishedConsumers: any[] = [];

    for (const consumer of this.consumers) {
      if (cache.get(event.getUniqueStamp(consumer.id))) {
        this.lastEvent = event;
        // we dont publish this event into this consumer anymore
        return null;
      }

      cache.set(event.getUniqueStamp(consumer.id), true);

      const okOrError = consumer.matchEvent(event);
      if (okOrError === 'ok') {
        publishedConsumers.push(
          new Promise<void>(async (resolve, reject) => {
            let rejected = false;
            try {
              await transportAsyncStorage.run(
                {
                  consumerId: consumer.id,
                  consumerFunctionName: consumer.exec.name,
                },
                async () => await consumer.exec(event.payload),
              );
              // await
            } catch (reason: any) {
              reason.id = consumer.id;
              reason.execName =
                consumer.exec.name ||
                'Anonymous Function, please do not use arrow functions for the consumers';
              rejected = true;
              reject(reason);
            } finally {
              if (!rejected) resolve();
            }
          }),
        );
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
        const ref = setInterval(() => {
          if (this.ready) {
            clearInterval(ref);
            res();
          }
        }, 50);
      });
    }
  }

  /**
   * Adds a consumer to the transport itself - internal method
   */
  addConsumer(
    contract: iots.Any,
    fn: () => any,
    consumerId: string,
    loc: string,
    hookId?: string,
  ): void {
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

    this.consumers.push({ contract, exec: fn, matchEvent, loc, id: consumerId });
  }

  /**
   * Removes the consumer from the transport - internal method
   */
  removeConsumer(consumerReference: string | ((...args: any[]) => any)): void {
    if (typeof consumerReference === 'function') {
      this.consumers = this.consumers.filter(({ exec }) => exec !== consumerReference);
      return;
    }

    if (typeof consumerReference === 'string') {
      this.consumers = this.consumers.filter(({ id }) => id !== consumerReference);
      return;
    }

    throw new Error('Consumer id must be a string or function reference to remove');
  }

  async startAsyncTransport() {
    if (!this.ready && typeof this._startAsyncTransport === 'function')
      await this._startAsyncTransport();
  }

  /**
   * Removes all consumers from this transport instance - internal method
   */
  flushConsumers() {
    this.consumers = [];
  }

  _startAsyncTransport?(): Promise<void>;
  _publish?(event: Event): Promise<{
    orphanEvent?: boolean;
    publishedConsumers: PromiseSettledResult<void>[];
  }>;
}
