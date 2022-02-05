import { Event } from './event';
import { InternalTransport } from './internal-transport';
import { Transport } from './transports';

import { executionContext } from '../context/execution-context';

type PublishOptions<T extends boolean> = {
  excludeTransportNames?: string[];
  hook?: T;
};

export class TypedBusClass {
  transports: Transport[] = [];

  constructor() {
    this.transports.push(new InternalTransport());
  }

  /**
   *  @param excludeTransportNames - optional: this will exclude transports where this message is published to
   * */
  async publish<T extends boolean = false>(
    eventData: any,
    options: PublishOptions<T> = {},
  ): Promise<void> {
    const publishedTransports: string[] = [];
    const event = Event.create(eventData, options.hook);

    if (!executionContext.currentExecution) {
      executionContext.newContext().addEvent(event);
    }

    const publishPromises = this.transports.map((transport) => {
      if (options.excludeTransportNames && options.excludeTransportNames.includes(transport.name)) {
        return;
      }

      publishedTransports.push(transport.name);
      return transport.publish(event);
    });

    const results = await Promise.allSettled(publishPromises);

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Error publishing to transport ${publishedTransports[index]}`, result.reason);
      }
    });
  }

  /**
   *  @param excludeTransportNames - optional: this will exclude transports where this consumer is triggered from
   * */
  addConsumer(contract: any, fn: () => any, excludeTransportNames?: string[]) {
    this.transports.forEach((transport) => {
      if (excludeTransportNames && excludeTransportNames.includes(transport.name)) {
        return;
      }

      transport.addConsumer(contract, fn);
    });
  }

  addTransport(transport: Transport) {
    if (transport instanceof Transport && !this.transports.includes(transport)) {
      this.transports.push(transport);
    } else {
      throw new Error(
        `Transport ${transport.constructor.name} is not a Transport or is already added.`,
      );
    }
  }

  getTransportNames() {
    return this.transports.map((transport) => transport.name);
  }
}
