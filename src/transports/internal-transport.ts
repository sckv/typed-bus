import { isLeft } from 'fp-ts/lib/Either';

import { Event } from '../engine/event';
import { Consumer, Transport } from '../engine/transport';
import { reporter } from '../validation/reporter';

export class InternalTransport extends Transport {
  name = 'internal';
  consumers: Consumer[] = [];

  async _publish(event: Event): Promise<{
    orphanEvents: Event[];
    publishedEvents: PromiseSettledResult<void>[];
  }> {
    const orphanEvents: Event[] = [];

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

    return {
      orphanEvents,
      publishedEvents: await Promise.allSettled(publishedConsumers),
    };
  }
}
