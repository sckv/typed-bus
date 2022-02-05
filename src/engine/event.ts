import hyperid from 'hyperid';
import { cloneDeep, isEqual } from 'lodash';

import { deepFreeze } from './utils';

import { executionContext } from '../context/execution-context';

const uuidGenerate = hyperid();
const hookIdGenerate = hyperid();

export class Event<T = any> {
  uuid: string;
  hookId?: string;
  timestamp: number;
  payload: T;

  private constructor(payload: any, hook?: boolean) {
    this.uuid = uuidGenerate();
    this.hookId = this.setHookId(hook);
    this.timestamp = Date.now();
    this.payload = deepFreeze(payload);

    Object.freeze(this);
  }

  setHookId(hook?: boolean) {
    if (executionContext.currentExecution?.currentEvent?.hookId) {
      return executionContext.currentExecution?.currentEvent?.hookId;
    }

    return hook ? hookIdGenerate() : undefined;
  }

  getUniqueStamp() {
    return `${this.timestamp}-${this.uuid}`;
  }

  equals(to: Event) {
    if (this.uuid !== to.uuid && this.timestamp !== to.timestamp) return false;
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

  static create<T>(payload: T, hook?: boolean) {
    return new Event<T>(cloneDeep(payload), hook);
  }
}
