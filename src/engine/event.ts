import hyperid from 'hyperid';
import { cloneDeep, isEqual } from 'lodash';

import { deepFreeze } from './utils';

const uuidGenerate = hyperid();
const hookIdGenerate = hyperid();

export class Event<T = any> {
  uuid: string;
  hookId?: string;
  timestamp: number;
  payload: T;

  private constructor(payload: any, hook?: boolean) {
    this.uuid = uuidGenerate();
    this.hookId = hook ? hookIdGenerate() : undefined;
    this.timestamp = Date.now();
    this.payload = deepFreeze(payload);

    Object.freeze(this);
  }

  equals(to: Event) {
    if (this.uuid !== to.uuid) return false;
    if (this.isBefore(to) || this.isAfter(to)) return false;
  }

  payloadEquals(to: Event) {
    // we only make deep comparison while in a shallow manner the events are equal
    // usually there should never be this situation
    return isEqual(this.payload, to.payload);
  }

  isBefore(comparedTo: Event) {
    return this.timestamp < comparedTo.timestamp;
  }

  isAfter(comparedTo: Event) {
    return this.timestamp > comparedTo.timestamp;
  }

  toJSON() {
    return this.payload;
  }

  static create<T>(payload: T, hook?: boolean) {
    return new Event<T>(cloneDeep(payload), hook);
  }
}
