/* eslint-disable max-classes-per-file */
import * as iots from 'io-ts';

import { TypedBus, DumpController, Event } from '../index';
import { Consume } from '../decorators/consume';

class Dump extends DumpController {
  constructor() {
    super(1, 'single');
  }
  dump(event: Event<any>): Promise<void> {
    console.log({ dumpedOrphanEvent: event });
    return Promise.resolve();
  }

  dumpMultiple(): Promise<void> {
    return Promise.resolve();
  }
}

// TypedBus.setEventsDumpController(new Dump(), 'used');
class ConsumerTest {
  @Consume(iots.type({ name: iots.string, age: iots.number }))
  async justConsumer(data: any) {
    console.log('I just consumed name and age event', data);

    const hookResponse = await TypedBus.publish(
      { amount: 1234, currency: 'EUR' },
      { hook: iots.type({ hookProp: iots.literal('value'), hookValue: iots.number }) },
    );

    console.log('received from hook resolution', hookResponse);
  }

  @Consume(iots.type({ amount: iots.number, currency: iots.string }))
  async anotherConsumer(data: any) {
    console.log('I just consumed the money event', data);
    await TypedBus.publish({ some: 'event', is: 'orphan' });
    await TypedBus.publish({ hookProp: 'value', hookValue: 123 });
    console.log(TypedBus.orphanEventsStore);
    console.log(TypedBus.usedEventsStore);
  }
}

new ConsumerTest();

setTimeout(async () => {
  TypedBus.publish({ name: 'test', age: 4 });
  console.log('published event');
}, 1500);

setTimeout(() => {
  console.log('Exit');
  TypedBus.publish({ name: 'test', age: 2 });
}, 3000);
