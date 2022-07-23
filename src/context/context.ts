import { Execution } from './execution';

import asyncHooks from 'async_hooks';

type Context = {
  traces: Map<number, Execution>;
  current?: Execution;
  newExecution: () => Execution;
  enable: () => asyncHooks.AsyncHook;
  enabled: boolean;
};

const prevStates = new Map();

export const context: Context = {
  traces: new Map<string, Execution>(),
  enabled: false,
  newExecution: () => {
    context.current = new Execution();
    context.traces.set(asyncHooks.executionAsyncId(), context.current);
    return context.current;
  },
} as any;

function init(asyncId: number, _type: string, triggerAsyncId: number) {
  if (context.traces.has(triggerAsyncId)) {
    context.traces.set(asyncId, context.traces.get(triggerAsyncId)!);
  }
}

function before(asyncId: number) {
  if (!context.traces.has(asyncId)) {
    return;
  }
  prevStates.set(asyncId, context.current);
  context.current = context.traces.get(asyncId);
}

function after(asyncId: number) {
  if (!context.traces.has(asyncId)) {
    return;
  }
  context.current = prevStates.get(asyncId);
}

function destroy(asyncId: number) {
  if (context.traces.has(asyncId)) {
    context.traces.delete(asyncId);
    prevStates.delete(asyncId);
  }
}

asyncHooks
  .createHook({
    init,
    before,
    after,
    destroy,
  })
  // enable by default
  // TODO: see implications
  // TODO: change to AsyncStorage
  .enable();
