import hyperid from 'hyperid';
import { cloneDeep, isEqual } from 'lodash';

import { deepFreeze } from './utils';

import { context } from '../context/context';

const uuidGenerate = hyperid();
const hookIdGenerate = hyperid();

export class Event<T = any> {
  uuid: string;
  hookId?: string;
  timestamp: number;
  payload: T;
  orphanTransports?: Set<string>;
  publishedTransports?: Set<string>;

  private constructor(payload: any, hook?: boolean) {
    this.uuid = uuidGenerate();
    this.hookId = this.getHook(hook);
    this.timestamp = Date.now();
    this.payload = deepFreeze(payload);

    Object.defineProperty(this, 'uuid', { writable: false, configurable: false });
    Object.defineProperty(this, 'timestamp', { writable: false, configurable: false });
    Object.defineProperty(this, 'payload', { writable: false, configurable: false });
  }

  getHook(hook?: boolean) {
    if (context.current?.currentEvent?.hookId) {
      return context.current?.currentEvent?.hookId;
    }

    return hook ? hookIdGenerate() : undefined;
  }

  getUniqueStamp(transport?: string) {
    return `${this.timestamp}-${this.uuid}${transport ? `-${transport}` : ''}`;
  }

  equals(to: Event) {
    if (this.uuid !== to.uuid || this.timestamp !== to.timestamp) return false;
    return true;
  }

  payloadEquals(to: Event) {
    // we only make deep comparison while in a shallow manner the events are equal
    // usually there should never be this situation
    return isEqual(this.payload, to.payload);
  }

  isBefore(event: Event) {
    return this.timestamp < event.timestamp;
  }

  isAfter(event: Event) {
    return this.timestamp > event.timestamp;
  }

  toJSON() {
    return this.payload;
  }

  cleanHookId() {
    this.hookId = undefined;
  }

  addOrphanTransport(transport: string) {
    if (!this.orphanTransports) this.orphanTransports = new Set();
    this.orphanTransports.add(transport);
  }

  addPublishedTransport(transport: string) {
    if (!this.publishedTransports) this.publishedTransports = new Set();
    this.publishedTransports.add(transport);
  }

  static create<T>(payload: T, hook?: boolean) {
    return new Event<T>(cloneDeep(payload), hook);
  }
}
