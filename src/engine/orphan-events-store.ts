import { Event } from './event';

export class OrphanEventsStore {
  orphanedEvents: Event[] = [];

  addEvent(event?: Event): void {
    if (!event) return;

    if (this.orphanedEvents.findIndex((oe) => oe.equals(event)) === -1 /** no entry */) {
      this.orphanedEvents.push(event);
    }
  }

  addEvents(events?: Event[]): void {
    if (!events) return;

    events.forEach((event) => this.addEvent(event));
  }
}
