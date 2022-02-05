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

  async _publish(event: Event<any>): Promise<PromiseSettledResult<void>[]> {
    const publishedConsumers = this.consumers.map(async (consumer) => {
      const decode = consumer.contract.decode(event);
      if (!isLeft(decode)) {
        await consumer.fn(event.payload);
      } else {
        if (Object.keys(decode.left).length < 2) {
          console.log(reporter(decode));
          console.log(
            `Event just have 1 error, maybe there's a malformed object for a consumer ${consumer.fn.name} with type ${consumer.contract.name}`,
          );
        }

        orphanEvents.push(event);
      }
    });

    return await Promise.allSettled(publishedConsumers);
  }

  addConsumer(contract: iots.Any, fn: () => any) {
    const contractIntersection = iots.intersection([
      iots.type({ payload: contract }),
      EventBaseType,
    ]);

    this.consumers.push({ contract: contractIntersection, fn });
  }
}
