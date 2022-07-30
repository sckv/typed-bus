/* eslint-disable max-classes-per-file */

import LRUCache from 'lru-cache';

import { Event } from '../engine/event';

/**
 *
 * All events that have no `rootUUID` are considered root events.
 * Root events are the first events of a chain of events.
 * They are the events that are published by the user.
 * All the events that have `launchedFrom` are considered child events.
 * Child events are the events that are published by the consumers.
 * Child events are grouped by same `launchedFrom` and `rootUUID`.
 * Child events may considered as a chain of events.
 * Build a tree that contains all the events and the structure of the chain of events.
 */

const cache = new LRUCache({ max: 1000000, ttl: 1000 });
export class GraphStorage {
  saveAndCommit(event: Event[]) {
    if (event.rootUUID) {
      const rootEvent = this.get(event.rootUUID);
      if (rootEvent) {
        rootEvent.addChild(event);
        this.save(rootEvent);
      } else {
        this.save(event);
      }
    } else {
      this.save(event);
    }
  }
}
