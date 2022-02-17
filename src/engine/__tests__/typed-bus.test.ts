/* eslint-disable max-classes-per-file */
import * as iots from 'io-ts';

import { Consume } from '../../decorators/consume';
import { TypedBus } from '../instance';

afterEach(() => {
  TypedBus.flushConsumers();
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

    await new Promise((res) => setTimeout(res, 100));

    expect(console.error).toHaveBeenCalledWith(
      'Error in consumer named "method"',
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
