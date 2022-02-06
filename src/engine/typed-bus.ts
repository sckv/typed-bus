import { Event } from './event';
import { Transport } from './transport';
import { OrphanEventsStore } from './orphan-events-store';

import { InternalTransport } from '../transports/internal-transport';
import { executionContext } from '../context/execution-context';

type PublishOptions<T extends boolean> = {
  excludeTransportNames?: string[];
  hook?: T;
};

export class TypedBusClass {
  transports: Transport[] = [];
  orphanEventsStore = new OrphanEventsStore();

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

    this.storeInContext(event);

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
      } else {
        if (!result.value) return;

        if (result.value.orphanEvent) {
          event.addOrphanTransport(result.value.transport);
        } else {
          event.addPublishedTransport(result.value.transport);
        }
      }
    });

    if (event.orphanTransports?.length) this.orphanEventsStore.addEvent(event);
  }

  storeInContext(event: Event): void {
    if (!executionContext.currentExecution) {
      executionContext.newContext().addEvent(event);
    } else {
      executionContext.currentExecution.addEvent(event);
    }
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
