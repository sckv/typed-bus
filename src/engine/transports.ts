import { Event } from './event';

export abstract class Transport {
  abstract name: string;

  constructor() {
    if (typeof this.addConsumer !== 'function') {
      throw new Error(
        `Transport ${this.constructor.name} does not implement an addConsumer method.`,
      );
    }
  }

  async publish(event: Event): Promise<any> {
    if (typeof this._publish !== 'function') {
      throw new Error(`Transport ${this.constructor.name} does not implement a _publish method.`);
    }

    await this._publish(event);
  }

  abstract addConsumer(contract: any, fn: () => any): void;
  abstract _publish(event: Event): Promise<any>;
}
