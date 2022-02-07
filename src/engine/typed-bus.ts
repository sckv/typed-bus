import * as iots from 'io-ts';
import hyperid from 'hyperid';

import { Event } from './event';
import { Transport } from './transport';
import { OrphanEventsStore } from './orphan-events-store';

import { InternalTransport } from '../transports/internal-transport';
import { context } from '../context/context';

const generateConsumerId = hyperid();

type PublishOptions<T> = {
  onlySendTo?: string[];
  hook?: iots.Any;
};

export class TypedBusClass {
  transports: Transport[] = [];
  orphanEventsStore = new OrphanEventsStore();

  constructor() {
    this.transports.push(new InternalTransport());
  }

  async publish<T = false>(
    eventData: any,
    options: PublishOptions<T> = {},
  ): Promise<void | unknown> {
    const publishedTransports: string[] = [];
    const event = Event.create(eventData, typeof options.hook !== undefined);

    this.storeInContext(event);
    let hookPromise: unknown = undefined;

    if (options.hook) {
      hookPromise = new Promise<unknown>((resolve, reject) => {
        const consumerId = { id: '' };
        const timoutRef = setTimeout(reject, 1000);

        const resolver = (resultData: unknown) => {
          this.removeConsumer(consumerId.id);
          clearTimeout(timoutRef);

          resolve(resultData);
        };

        consumerId.id = this.addConsumer(options.hook!, resolver, { hookId: event.hookId }).id;
      });
    }

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

    return hookPromise;
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
  addConsumer(
    contract: iots.Any,
    exec: (...args: any[]) => any,
    options: { listenTo?: string[]; hookId?: string } = {},
  ) {
    const consumerId = generateConsumerId();
    const transportsList = options.listenTo?.length ? options.listenTo : ['internal'];

    let orphanConsumer = true;
    this.transports.forEach((transport) => {
      if (transportsList.includes(transport.name)) {
        transport.addConsumer(contract, exec, consumerId, options.hookId);
        orphanConsumer = false;
      }

      return;
    });

    if (orphanConsumer) {
      console.log(
        `There is no transports '${options.listenTo?.join(',')}' for this consumer ${
          contract.name
        } - ${exec.name}.`,
      );
    }

    return {
      id: consumerId,
    };
  }

  removeConsumer(consumerId: string, fromTransports?: string[]): void {
    this.transports.forEach((transport) => {
      if (fromTransports?.includes(transport.name)) {
        transport.removeConsumer(consumerId);
      } else if (!fromTransports) {
        transport.removeConsumer(consumerId);
      }
      return;
    });
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
