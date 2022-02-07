import * as iots from 'io-ts';

import { Event } from './event';
import { Transport } from './transport';
import { OrphanEventsStore } from './orphan-events-store';

import { InternalTransport } from '../transports/internal-transport';
import { context } from '../context/context';

type PublishOptions<T extends boolean> = {
  onlySendTo?: string[];
  hook?: T;
};

export class TypedBusClass {
  transports: Transport[] = [];
  orphanEventsStore = new OrphanEventsStore();

  constructor() {
    this.transports.push(new InternalTransport());
  }

  async publish<T extends boolean = false>(
    eventData: any,
    options: PublishOptions<T> = {},
  ): Promise<void> {
    const publishedTransports: string[] = [];
    const event = Event.create(eventData, options.hook);

    this.storeInContext(event);

    const publishPromises = this.transports.map(async (transport) => {
      if (options.onlySendTo && options.onlySendTo.includes(transport.name)) {
        publishedTransports.push(transport.name);
        return transport.publish(event);
      } else if (!options.onlySendTo) {
        publishedTransports.push(transport.name);
        return transport.publish(event);
      }

      throw new Error('There is no transport for this event');
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

    if (event.orphanTransports?.size) this.orphanEventsStore.addEvent(event);
  }

  storeInContext(event: Event): void {
    if (!context.current) {
      context.newContext().addEvent(event);
    } else {
      context.current.addEvent(event);
    }
  }

  /**
   *  @param listenTo - optional: this will add more transports to be listened to
   * */
  addConsumer(contract: iots.Any, exec: () => any, listenTo?: string[]) {
    const transportsList = listenTo && listenTo instanceof Array ? listenTo : ['internal'];
    let orphanConsumer = true;
    this.transports.forEach((transport) => {
      if (transportsList.includes(transport.name)) {
        transport.addConsumer(contract, exec);
        orphanConsumer = false;
      }

      return;
    });

    if (orphanConsumer) {
      console.log(
        `There is no transports '${listenTo?.join(',')}' for this consumer ${contract.name} - ${
          exec.name
        }.`,
      );
    }
  }

  addTransport(transport: Transport) {
    if (transport instanceof Transport && !this.transports.includes(transport)) {
      transport.startAsyncTransport().catch(console.error);
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
