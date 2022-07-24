import { BareHttp } from 'barehttp';
import * as iots from 'io-ts';
import axios from 'axios';

import { TypedBus } from '../instance';

const app = new BareHttp({ serverPort: 3000 });

app.route.get({
  route: '/route',
  handler: async (flex) => {
    const hookResponse = await TypedBus.publish(
      { data: 'test' },
      { hook: iots.type({ response: iots.string }) },
    );

    flex.send(hookResponse);
  },
});

beforeAll(async () => {
  await app.start();

  TypedBus.flushConsumers();

  TypedBus.addConsumer(iots.type({ data: iots.literal('test') }), function consumer() {
    TypedBus.publish({ response: 'done' });
  });
});

afterAll(async () => {
  await app.stop();
  TypedBus.flushConsumers();
});

describe('Bus Context suite', () => {
  it('call for a hook response', async () => {
    const callOne = axios.get('http://localhost:3000/route');
    const callTwo = axios.get('http://localhost:3000/route');

    const { data: dataOne } = await callOne;
    const { data: dataTwo } = await callTwo;

    expect(dataOne.result.response).toBe('done');
    expect(dataTwo.result.response).toBe('done');

    // here we check that each hook creation
    // is isolated and won't conflict with each other
    // or return wrong crossed results or values
    expect(dataTwo.hookId).not.toBe(dataOne.hookId);
  });
});
