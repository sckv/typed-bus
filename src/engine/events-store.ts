import { Event } from './event';

export class EventsStore {
  events = new Map<string, Event>();

  addEvent(event?: Event): void {
    if (!event) return;

    this.events.set(event.getUniqueStamp(), event);
  }

  addEvents(events?: Event[]): void {
    if (!events) return;

    events.forEach((event) => this.addEvent(event));
  }

  dumpEvents(): Event[] {
    const events = Array.from(this.events.values());
    this.events = new Map<string, Event>();

    return events;
  }
}
