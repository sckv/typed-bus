import { Event } from '../engine/event';

export class Execution {
  events: Event[] = [];

  currentEvent: Event | undefined;

  addEvent(event: Event) {
    this.currentEvent = event;
    this.events.push(event);
  }
}
