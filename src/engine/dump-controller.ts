import { EventsStore } from './events-store';

const MODE = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
} as const;

export abstract class DumpController {
  injectedStore?: EventsStore;
  timeout?: NodeJS.Timeout;

  constructor(private interval = 5000, private mode: 'single' | 'multiple' = MODE.SINGLE) {
    this.attachGracefulHandlers();
  }

  async executeDumpOperation() {
    if (this.mode === MODE.SINGLE) {
      await this.dumpSingleEvents().catch((err) =>
        console.error('Error dumping events by single method', err),
      );
    } else {
      await this.dumpMultipleEvents().catch((err) =>
        console.error('Error dumping events by multiple method', err),
      );
    }
  }

  async dumpSingleEvents() {
    const savingEventsPromises =
      this.injectedStore?.dumpEvents().map((event) => {
        return this.dump(event.toFullEvent());
      }) || [];

    // TODO: add logs?
    await Promise.allSettled(savingEventsPromises);
  }

  async dumpMultipleEvents() {
    await this.dumpMultiple?.(
      this.injectedStore?.dumpEvents().map((event) => event.toFullEvent()) || [],
    );
  }

  injectStore(store: EventsStore) {
    this.injectedStore = store;
  }

  launchTimer() {
    this.timeout = setInterval(() => this.executeDumpOperation(), this.interval);
  }

  clearTimeout() {
    clearTimeout(this.timeout!);
  }

  private attachGracefulHandlers() {
    const graceful = async (code = 0) => {
      await this.executeDumpOperation();
      clearTimeout(this.timeout!);

      process.exit(code);
    };

    // Stop graceful
    process.on('uncaughtException', (err) => {
      console.error(err);
      graceful(1);
    });

    process.on('SIGTERM', graceful);
    process.on('SIGINT', graceful);
  }

  abstract dump(event: { [k: string]: any }): Promise<void>;
  dumpMultiple?(events: { [k: string]: any }[]): Promise<void>;
}
