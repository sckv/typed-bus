import * as iots from 'io-ts';

import { TypedBus } from './index';

import { Consume } from './decorators/consume';

class ConsumerTest {
  @Consume(iots.type({ name: iots.string, age: iots.number }))
  justConsumer(data: any) {
    console.log('I just consumed', data);
  }
}

new ConsumerTest();

setTimeout(() => {
  TypedBus.publish({ eventData: { name: 'test', age: 4 } });
}, 1500);

setTimeout(() => {
  console.log('Exit');
}, 3000);
