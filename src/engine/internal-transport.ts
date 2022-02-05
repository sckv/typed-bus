import * as iots from 'io-ts';
import { isLeft } from 'fp-ts/lib/Either';

import { Event } from './event';
import { Transport } from './transports';

import { EventBaseType } from '../validation/event-base-type';
import { reporter } from '../validation/reporter';

const orphanEvents: Event[] = [];

export class InternalTransport extends Transport {
  name = 'internal';
  consumers: { contract: iots.Any; fn: (...args: any[]) => any }[] = [];
  lastEvent: Event | undefined;

  async _publish(event: Event<any>): Promise<PromiseSettledResult<void>[]> {
    if (this.lastEvent && this.lastEvent?.isAfter(event)) {
      console.error(
        'Next event to publish was produced before than the last published event. Discarded',
      );
      return [];
    }

    const publishedConsumers = this.consumers.map(async (consumer) => {
      const decode = consumer.contract.decode(event);
      if (!isLeft(decode)) {
        await consumer.fn(event.payload);
      } else {
        if (Object.keys(decode.left).length < 3) {
          console.log(reporter(decode));
          console.log(
            `Event just have less than 3 errors, maybe there's a malformed object for a consumer ${consumer.fn.name} with type ${consumer.contract.name}`,
          );
        }

        orphanEvents.push(event);
      }
    });

    return await Promise.allSettled(publishedConsumers);
  }

  addConsumer(contract: iots.Any, fn: () => any) {
    this.consumers.push({ contract: iots.union([contract, EventBaseType]), fn });
  }
}
