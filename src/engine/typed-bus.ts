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
  hook?: T extends iots.Any ? T : never;
  hookTimeout?: T extends iots.Any ? number : never;
};

export class TypedBusClass {
  transports: Transport[] = [];
  orphanEventsStore = new OrphanEventsStore();

  constructor() {
    this.transports.push(new InternalTransport());
  }

  async publish<T, R = T extends iots.Any ? iots.OutputOf<T> : void>(
    eventData: any,
    options: PublishOptions<T> = {},
  ): Promise<R> {
    const publishedTransports: string[] = [];
    const event = Event.create(eventData, typeof options.hook !== undefined);

    this.storeInContext(event);
    let hookPromise: unknown = undefined;

    if (options.hook) {
      hookPromise = new Promise<any>((resolve, reject) => {
        const consumerId = { id: '' };
        const timoutRef = setTimeout(() => {
          reject(new Error(`Timeout exceeded for a waiting hook ${options.hook!.name}`));
        }, options.hookTimeout || 10000);

        const resolver = (resultData: unknown) => {
          this.removeConsumer(consumerId.id);
          clearTimeout(timoutRef);

          resolve(resultData as any);
        };

        consumerId.id = this.addConsumer(options.hook!, resolver, { hookId: event.hookId }).id;
      }).finally(() => context.current?.currentEvent?.cleanHookId());
    }

    const publishPromises = this.transports.map((transport) => {
      if (options.onlySendTo && options.onlySendTo.includes(transport.name)) {
        publishedTransports.push(transport.name);
        return transport.publish(event);
      } else if (!options.onlySendTo) {
        publishedTransports.push(transport.name);
        return transport.publish(event);
      }

      return null;
    });

    if (publishPromises.every((val) => val === null)) {
      throw new Error(`There's no transports to publish to. ${options.onlySendTo?.join(',')}`);
    }

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
        result.value.publishedConsumers?.forEach((value) => {
          if (value.status == 'rejected') {
            console.error(`Error in consumer named "${value.reason.execName}"`, value.reason);
          }
        });
      }
    });

    if (event.orphanTransports?.size) this.orphanEventsStore.addEvent(event);

    return hookPromise as any;
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

  removeConsumer(
    consumerReference: string | ((...args: any[]) => any),
    fromTransports?: string[],
  ): void {
    this.transports.forEach((transport) => {
      if (fromTransports?.includes(transport.name)) {
        transport.removeConsumer(consumerReference);
      } else if (!fromTransports) {
        transport.removeConsumer(consumerReference);
      }
      return;
    });
  }

  addTransport(transport: Transport) {
    if (
      transport instanceof Transport &&
      !this.transports.includes(transport) &&
      !this.transports.find((t) => t.name === transport.name)
    ) {
      transport.startAsyncTransport().catch(console.error);
      this.transports.push(transport);
    } else {
      throw new Error(
        `Transport ${transport.constructor.name} is not a Transport or is already added.`,
      );
    }
  }

  flushConsumers() {
    this.transports.forEach((transport) => {
      transport.flushConsumers();
    });
  }

  flushTransports() {
    this.transports = [new InternalTransport()];
  }

  removeTransport(transportName: string) {
    this.transports = this.transports.filter((t) => t.name !== transportName);
  }

  getTransportNames() {
    return this.transports.map((transport) => transport.name);
  }
}
