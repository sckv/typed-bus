import { Execution } from './execution';

import asyncHooks from 'async_hooks';

type Context = {
  traces: { [k: string]: Execution };
  current?: Execution;
  newContext: () => Execution;
  enable: () => asyncHooks.AsyncHook;
  enabled: boolean;
};

const prevStates = {};

const context: Context = {
  traces: {},
  enabled: false,
  newContext: () => {
    context.current = new Execution();
    context.traces[asyncHooks.executionAsyncId()] = context.current;
    return context.current;
  },
} as any;

function init(asyncId: number, _type: string, triggerAsyncId: number) {
  if (context.traces[triggerAsyncId]) {
    context.traces[asyncId] = context.traces[triggerAsyncId];
  }
}

function before(asyncId: number) {
  if (!context.traces[asyncId]) {
    return;
  }
  prevStates[asyncId] = context.current;
  context.current = context.traces[asyncId];
}

function after(asyncId: number) {
  if (!context.traces[asyncId]) {
    return;
  }
  context.current = prevStates[asyncId];
}

function destroy(asyncId: number) {
  if (context.traces[asyncId]) {
    delete context.traces[asyncId];
    delete prevStates[asyncId];
  }
}

const hook = asyncHooks.createHook({
  init,
  before,
  after,
  destroy,
});

// enable by default
// TODO: see implications
// TODO: change to AsyncStorage
hook.enable();

export { context };
