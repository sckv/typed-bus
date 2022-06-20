import { Event } from '../engine/event';

export class Node {
  v?: Event;
  children: Node[] = [];

  constructor(event: Event) {
    this.v = event;
  }

  hasValue() {
    return !!this.v;
  }
}
