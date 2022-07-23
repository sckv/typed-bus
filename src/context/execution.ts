import { Event } from '../engine/event';

import { randomUUID } from 'crypto';
export class Execution {
  events: Event[] = [];

  currentEvent: Event | undefined;

  executionId: string;

  constructor() {
    this.executionId = randomUUID();
  }

  addEvent(event: Event) {
    event.setExecutionId(this.executionId);

    // this should make the events inheritable
    event.setParentUUID(this.currentEvent?.uuid);

    this.currentEvent = event;
    this.events.push(event);
  }
}
