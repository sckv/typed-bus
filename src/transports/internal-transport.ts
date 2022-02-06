import { Event } from '../engine/event';
import { Transport } from '../engine/transport';

export class InternalTransport extends Transport {
  name = 'internal';

  async _publish(event: Event): Promise<{
    orphanEvent?: boolean;
    publishedConsumers: PromiseSettledResult<void>[];
  }> {
    const publishedConsumers: Promise<void>[] = [];

    for (const consumer of this.consumers) {
      const okOrError = consumer.matchEvent(event);
      if (okOrError === true) {
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
      orphanEvent: publishedConsumers.length === 0 ? true : false,
      publishedConsumers: await Promise.allSettled(publishedConsumers),
    };
  }

  _startAsyncTransport(): Promise<void> {
    return Promise.resolve();
  }
}
