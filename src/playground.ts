import * as iots from 'io-ts';

import { TypedBus } from './index';

import { Consume } from './decorators/consume';
import { executionContext } from './context/execution-context';

class ConsumerTest {
  @Consume(iots.type({ name: iots.string, age: iots.number }))
  justConsumer(data: any) {
    console.log('I just consumed name and age event', data);
    TypedBus.publish({ amount: 1234, currency: 'EUR' });
  }

  @Consume(iots.type({ amount: iots.number, currency: iots.string }))
  anotherConsumer(data: any) {
    console.log('I just consumed the money event', data);
    console.log(executionContext.currentExecution?.events);
  }
}

new ConsumerTest();

setTimeout(() => {
  TypedBus.publish({ name: 'test', age: 4 }, { hook: true });
}, 1500);

setTimeout(() => {
  console.log('Exit');
}, 3000);
