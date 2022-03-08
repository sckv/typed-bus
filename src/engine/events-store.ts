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

  getEvents(): Event[] {
    return Array.from(this.events.values());
  }

  cleanEvents(): void {
    this.events = new Map<string, Event>();
  }
}
