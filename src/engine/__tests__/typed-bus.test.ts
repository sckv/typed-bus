/* eslint-disable max-classes-per-file */
import * as iots from 'io-ts';

import { Consume } from '../../decorators/consume';
import { TypedBus } from '../instance';
import { Transport } from '../transport';

afterEach(() => {
  TypedBus.flushConsumers();
  TypedBus.flushTransports();
});

describe('Typed-Bus suite', () => {
  it('should sync consume on single consumer', () => {
    const spy = jest.fn();

    class Test {
      @Consume(iots.type({ amount: iots.number, currency: iots.string }))
      method(props: { amount: number; currency: string }) {
        spy(props);
      }
    }

    new Test();

    TypedBus.publish({ amount: 1, currency: 'EUR' });

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith({ amount: 1, currency: 'EUR' });
  });

  it('should sync consume on two different consumers', () => {
    const spy = jest.fn();
    const secondSpy = jest.fn();

    class Test {
      @Consume(iots.type({ amount: iots.number, currency: iots.string }))
      method(props: { amount: number; currency: string }) {
        spy(props);
      }

      @Consume(iots.type({ amount: iots.number, currency: iots.string }))
      secondMethod(props: { amount: number; currency: string }) {
        secondSpy(props);
      }
    }

    new Test();

    TypedBus.publish({ amount: 1, currency: 'EUR' });

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith({ amount: 1, currency: 'EUR' });

    expect(secondSpy).toHaveBeenCalled();
    expect(secondSpy).toHaveBeenCalledWith({ amount: 1, currency: 'EUR' });
  });

  it('should sync consume in chain', () => {
    const spy = jest.fn();
    const secondSpy = jest.fn();

    class Test {
      @Consume(iots.type({ amount: iots.number, currency: iots.string }))
      method(props: { amount: number; currency: string }) {
        spy(props);

        TypedBus.publish({ name: 'Frank', age: 50 });
      }

      @Consume(iots.type({ name: iots.string, age: iots.number }))
      secondMethod(props: { age: number; name: string }) {
        secondSpy(props);
      }
    }

    new Test();

    TypedBus.publish({ amount: 1, currency: 'EUR' });

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith({ amount: 1, currency: 'EUR' });

    expect(secondSpy).toHaveBeenCalled();
    expect(secondSpy).toHaveBeenCalledWith({ name: 'Frank', age: 50 });
  });

  it('should async consume in chain', (done) => {
    const spy = jest.fn();
    const secondSpy = jest.fn();

    class Test {
      @Consume(iots.type({ amount: iots.number, currency: iots.string }))
      async method(props: { amount: number; currency: string }) {
        spy(props);

        await new Promise<void>((res) => {
          TypedBus.publish({ name: 'Frank', age: 50 });
          res();
        });
      }

      @Consume(iots.type({ name: iots.string, age: iots.number }))
      secondMethod(props: { age: number; name: string }) {
        secondSpy(props);
        done();
      }
    }

    new Test();

    TypedBus.publish({ amount: 1, currency: 'EUR' });

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith({ amount: 1, currency: 'EUR' });

    expect(secondSpy).toHaveBeenCalled();
    expect(secondSpy).toHaveBeenCalledWith({ name: 'Frank', age: 50 });
  });

  it('should async wait for a coming back event response', async () => {
    const spy = jest.fn();
    const secondSpy = jest.fn();

    class Test {
      @Consume(iots.type({ amount: iots.number, currency: iots.string }))
      async method(props: { amount: number; currency: string }) {
        spy(props);

        await new Promise<void>((res) => {
          TypedBus.publish({ name: 'Frank', age: 50 });
          res();
        });
      }

      @Consume(iots.type({ name: iots.string, age: iots.number }))
      secondMethod(props: { age: number; name: string }) {
        secondSpy(props);
        TypedBus.publish({ ageResponse: 50 });
      }
    }

    new Test();

    const hookedResponse = await TypedBus.publish(
      { amount: 1, currency: 'EUR' },
      { hook: iots.type({ ageResponse: iots.number }) },
    );

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith({ amount: 1, currency: 'EUR' });

    expect(secondSpy).toHaveBeenCalled();
    expect(secondSpy).toHaveBeenCalledWith({ name: 'Frank', age: 50 });

    expect(hookedResponse).toEqual({ ageResponse: 50 });
  });

  it('should async throw when is timed out for the hooked response', async () => {
    const spy = jest.fn();
    const secondSpy = jest.fn();

    class Test {
      @Consume(iots.type({ amount: iots.number, currency: iots.string }))
      async method(props: { amount: number; currency: string }) {
        spy(props);

        await new Promise<void>((res) => {
          TypedBus.publish({ name: 'Frank', age: 50 });
          res();
        });
      }

      @Consume(iots.type({ name: iots.string, age: iots.number }))
      secondMethod(props: { age: number; name: string }) {
        secondSpy(props);
      }
    }

    new Test();

    await expect(
      TypedBus.publish(
        { amount: 1, currency: 'EUR' },
        { hook: iots.type({ ageResponse: iots.number }), hookTimeout: 100 },
      ),
    ).rejects.toThrow('Timeout exceeded for a waiting hook { ageResponse: number }');

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith({ amount: 1, currency: 'EUR' });

    expect(secondSpy).toHaveBeenCalled();
    expect(secondSpy).toHaveBeenCalledWith({ name: 'Frank', age: 50 });
  });

  it('should log sync error', async () => {
    const spy = jest.fn();

    const consoleSpy = jest.spyOn(console, 'error');

    class Test {
      @Consume(iots.type({ amount: iots.number, currency: iots.string }))
      method(props: { amount: number; currency: string }) {
        spy(props);
        throw new Error('Sync error happened');
      }
    }

    new Test();

    TypedBus.publish({ amount: 1, currency: 'EUR' });

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith({ amount: 1, currency: 'EUR' });

    await new Promise((res) => setImmediate(res));

    expect(console.error).toHaveBeenCalledWith(
      'Error in consumer named "method"',
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it('should log async error', async () => {
    const spy = jest.fn();

    const consoleSpy = jest.spyOn(console, 'error');

    class Test {
      @Consume(iots.type({ amount: iots.number, currency: iots.string }))
      async asyncMethod(props: { amount: number; currency: string }) {
        spy(props);
        throw new Error('Async error happened');
      }
    }

    new Test();

    TypedBus.publish({ amount: 1, currency: 'EUR' });

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith({ amount: 1, currency: 'EUR' });

    await new Promise((res) => setImmediate(res));

    expect(console.error).toHaveBeenCalledWith(
      'Error in consumer named "asyncMethod"',
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it('adds a new sync start transport', async () => {
    const spyOld = jest.fn();
    const spyNew = jest.fn();

    class NewTransport extends Transport {
      name = 'new-transport';
    }

    TypedBus.addTransport(new NewTransport());

    class Test {
      @Consume(iots.type({ amount: iots.number, currency: iots.string }), {
        listenTo: ['internal'],
      })
      async fromInternalTransport(props: { amount: number; currency: string }) {
        spyOld(props);
      }

      @Consume(iots.type({ amount: iots.number, currency: iots.string }), {
        listenTo: ['new-transport'],
      })
      async fromNewTransport(props: { amount: number; currency: string }) {
        spyNew(props);
      }
    }

    new Test();

    TypedBus.publish({ amount: 1, currency: 'EUR' }, { onlySendTo: ['internal'] });
    TypedBus.publish({ amount: 2, currency: 'USD' }, { onlySendTo: ['new-transport'] });

    await new Promise((res) => setImmediate(res));

    expect(spyOld).toHaveBeenCalledTimes(1);
    expect(spyOld).toHaveBeenCalledWith({ amount: 1, currency: 'EUR' });

    expect(spyNew).toHaveBeenCalledTimes(1);
    expect(spyNew).toHaveBeenCalledWith({ amount: 2, currency: 'USD' });
  });

  it('adds a new async start transport', async () => {
    const spyOld = jest.fn();
    const spyNew = jest.fn();

    class NewTransport extends Transport {
      name = 'new-transport';
      waitForReady = true;
    }

    TypedBus.addTransport(new NewTransport());

    class Test {
      @Consume(iots.type({ amount: iots.number, currency: iots.string }), {
        listenTo: ['internal'],
      })
      async fromInternalTransport(props: { amount: number; currency: string }) {
        spyOld(props);
      }

      @Consume(iots.type({ amount: iots.number, currency: iots.string }), {
        listenTo: ['new-transport'],
      })
      async fromNewTransport(props: { amount: number; currency: string }) {
        spyNew(props);
      }
    }

    new Test();

    TypedBus.publish({ amount: 1, currency: 'EUR' }, { onlySendTo: ['internal'] });
    TypedBus.publish({ amount: 3, currency: 'JPY' }, { onlySendTo: ['new-transport'] });

    await new Promise((res) => setTimeout(res, 50));

    expect(spyOld).toHaveBeenCalledTimes(1);
    expect(spyOld).toHaveBeenCalledWith({ amount: 1, currency: 'EUR' });

    expect(spyNew).toHaveBeenCalledTimes(1);
    expect(spyNew).toHaveBeenCalledWith({ amount: 3, currency: 'JPY' });
  });

  it('adds new consumer with direct API', async () => {
    const spy = jest.fn();

    const contract = iots.type({ amount: iots.number, currency: iots.string });
    function consumer(props: { amount: number; currency: string }) {
      spy(props);
    }

    TypedBus.addConsumer(contract, consumer);

    TypedBus.publish({ amount: 1, currency: 'EUR' });

    await new Promise((res) => setTimeout(res));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ amount: 1, currency: 'EUR' });
  });

  it('adds new consumer with direct API and remove it by id', async () => {
    const spy = jest.fn();
    const spySecond = jest.fn();

    const contract = iots.type({ amount: iots.number, currency: iots.string });
    function consumer(props: { amount: number; currency: string }) {
      spy(props);
    }

    function consumer2(props: { amount: number; currency: string }) {
      spySecond(props);
    }

    TypedBus.addConsumer(contract, consumer);
    const consumerReference = TypedBus.addConsumer(contract, consumer2);

    TypedBus.removeConsumer(consumerReference.id);

    TypedBus.publish({ amount: 1, currency: 'EUR' });

    await new Promise((res) => setTimeout(res));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ amount: 1, currency: 'EUR' });

    expect(spySecond).not.toHaveBeenCalled();
  });

  it('adds new consumer with direct API and remove it by function reference', async () => {
    const spy = jest.fn();
    const spySecond = jest.fn();

    const contract = iots.type({ amount: iots.number, currency: iots.string });
    function consumer(props: { amount: number; currency: string }) {
      spy(props);
    }

    function consumer2(props: { amount: number; currency: string }) {
      spySecond(props);
    }

    TypedBus.addConsumer(contract, consumer);
    TypedBus.addConsumer(contract, consumer2);

    TypedBus.removeConsumer(consumer2);

    TypedBus.publish({ amount: 1, currency: 'EUR' });

    await new Promise((res) => setTimeout(res));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ amount: 1, currency: 'EUR' });

    expect(spySecond).not.toHaveBeenCalled();
  });

  it('adds new consumer with direct API and remove it only from 1 transport of two', async () => {
    const spy = jest.fn();
    const spySecond = jest.fn();

    class NewTransport extends Transport {
      name = 'new-transport';
    }

    TypedBus.addTransport(new NewTransport());

    const contract = iots.type({ amount: iots.number, currency: iots.string });
    function consumer(props: { amount: number; currency: string }) {
      spy(props);
    }

    function consumer2(props: { amount: number; currency: string }) {
      spySecond(props);
    }

    TypedBus.addConsumer(contract, consumer);
    TypedBus.addConsumer(contract, consumer2, { listenTo: ['internal', 'new-transport'] });

    TypedBus.removeConsumer(consumer2, ['internal']);

    TypedBus.publish({ amount: 1, currency: 'EUR' });

    await new Promise((res) => setTimeout(res));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ amount: 1, currency: 'EUR' });

    expect(spySecond).toHaveBeenCalledTimes(1);
    expect(spySecond).toHaveBeenCalledWith({ amount: 1, currency: 'EUR' });
  });

  it('feed the same event only once for same consumer even if its connected to multiple transports', async () => {
    const spy = jest.fn();
    const spySecond = jest.fn();

    class NewTransport extends Transport {
      name = 'new-transport';
    }

    TypedBus.addTransport(new NewTransport());

    const contract = iots.type({ amount: iots.number, currency: iots.string });
    function consumer(props: { amount: number; currency: string }) {
      spy(props);
    }

    function consumer2(props: { amount: number; currency: string }) {
      spySecond(props);
    }

    TypedBus.addConsumer(contract, consumer);
    TypedBus.addConsumer(contract, consumer2, { listenTo: ['internal', 'new-transport'] });

    TypedBus.publish({ amount: 1, currency: 'EUR' });

    await new Promise((res) => setTimeout(res));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ amount: 1, currency: 'EUR' });

    expect(spySecond).toHaveBeenCalledTimes(1);
    expect(spySecond).toHaveBeenCalledWith({ amount: 1, currency: 'EUR' });
  });

  it('do not let adding two identical transport instances', () => {
    class NewTransport extends Transport {
      name = 'new-transport';
    }

    const transport = new NewTransport();
    TypedBus.addTransport(transport);

    expect(() => TypedBus.addTransport(transport)).toThrowError(
      'Transport NewTransport is not a Transport or is already added.',
    );
  });

  it('do not let adding two identical transport names', () => {
    class NewTransport extends Transport {
      name = 'new-transport';
    }

    TypedBus.addTransport(new NewTransport());

    expect(() => TypedBus.addTransport(new NewTransport())).toThrowError(
      'Transport NewTransport is not a Transport or is already added.',
    );
  });
});
