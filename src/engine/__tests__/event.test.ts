import { Event } from '../event';

describe('Event suite', () => {
  it('create event with timespamp and uuid', () => {
    const event = Event.create({ payload: 'test' });

    expect(event.timestamp).toBeDefined();
    expect(event.uuid).toBeDefined();
  });

  it('event equals is working', () => {
    const event = Event.create({ payload: 'test' });
    const anotherEvent = Event.create({ payload: 'test' });

    expect(event.equals(event)).toBeTruthy();
    expect(event.equals(anotherEvent)).toBeFalsy();
  });

  it('event payloads equals is working', () => {
    const event = Event.create({ payload: 'test' });
    const anotherEvent = Event.create({ payload: 'test' });
    const anotherDifferentEvent = Event.create({ payload: 'test2' });

    expect(event.payloadEquals(anotherEvent)).toBeTruthy();
    expect(event.payloadEquals(anotherDifferentEvent)).toBeFalsy();
  });

  it('event isBefore and isAfter works', async () => {
    const event = Event.create({ payload: 'first' });
    await new Promise<void>((res) => {
      setTimeout(res, 5);
    });

    const after = Event.create({ payload: 'second' });
    await new Promise<void>((res) => {
      setTimeout(res, 5);
    });

    const lastOne = Event.create({ payload: 'second' });

    expect(event.isBefore(after)).toBeTruthy();
    expect(after.isBefore(lastOne)).toBeTruthy();
    expect(lastOne.isAfter(after)).toBeTruthy();
  });

  it('event to json', () => {
    const event = Event.create({ payload: 'test' });

    expect(event.toJSON()).toEqual({ payload: 'test' });
  });

  it('get unique stamp', () => {
    const event = Event.create({ payload: 'test' });

    expect(event.getUniqueStamp()).toMatch(/^\d+-\S+$/);
    expect(event.getUniqueStamp('transpOrt')).toMatch(/^\d+-\S+-transpOrt$/);
  });

  it('add orphan transports to the event', () => {
    const event = Event.create({ payload: 'test' });

    event.addOrphanTransport('transport1');

    expect([...event.orphanTransports!]).toEqual(['transport1']);

    event.addOrphanTransport('transport2');
    expect([...event.orphanTransports!]).toEqual(['transport1', 'transport2']);
  });
});
