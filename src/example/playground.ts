import * as iots from 'io-ts';

import { TypedBus } from '../index';
import { Consume } from '../decorators/consume';

class ConsumerTest {
  @Consume(iots.type({ name: iots.string, age: iots.number }))
  async justConsumer(data: any) {
    console.log('I just consumed name and age event', data);

    const hookResponse = await TypedBus.publish(
      { amount: 1234, currency: 'EUR' },
      { hook: iots.type({ hookProp: iots.string, hookValue: iots.number }) },
    );

    console.log('received from hook resolution', hookResponse);
  }

  @Consume(iots.type({ amount: iots.number, currency: iots.string }))
  async anotherConsumer(data: any) {
    console.log('I just consumed the money event', data);
    await TypedBus.publish({ some: 'event', is: 'orphan' });
    await TypedBus.publish({ hookProp: 'some value', hookValue: 123 });
    console.log(TypedBus.orphanEventsStore);
  }
}

new ConsumerTest();

setTimeout(() => {
  TypedBus.publish({ name: 'test', age: 4 });
}, 1500);

setTimeout(() => {
  console.log('Exit');
}, 3000);
