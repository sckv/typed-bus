/* eslint-disable max-classes-per-file */
import * as iots from 'io-ts';

import { Consume } from '../consume';

const mockAddConsumer = jest.fn();

jest.mock('../../engine/instance', () => ({
  TypedBus: { addConsumer: (...args) => mockAddConsumer(...args) },
}));

afterEach(() => {
  mockAddConsumer.mockClear();
});

describe('Consume decorator test', () => {
  it('should add a consumer to the internal typed bus with no listenTo setting', () => {
    const fakeContract = {} as iots.Any;

    class Test {
      @Consume(fakeContract)
      method() {}
    }

    new Test();

    expect(mockAddConsumer).toHaveBeenCalled();
    expect(mockAddConsumer).toHaveBeenCalledWith(fakeContract, expect.any(Function), {
      listenTo: undefined,
    });
  });

  it('should add a consumer to the internal typed bus with some listen to setting', () => {
    const fakeContract = {} as iots.Any;

    class Test {
      @Consume(fakeContract, { listenTo: ['test'] })
      method() {}
    }

    new Test();

    expect(mockAddConsumer).toHaveBeenCalled();
    expect(mockAddConsumer).toHaveBeenCalledWith(fakeContract, expect.any(Function), {
      listenTo: ['test'],
    });
  });
});
