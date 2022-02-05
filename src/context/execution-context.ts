import { Execution } from './execution';

import asyncHooks from 'async_hooks';

type ExecutionContext = {
  traces: { [k: string]: Execution };
  currentExecution?: Execution;
  newContext: () => Execution;
  enable: () => asyncHooks.AsyncHook;
  enabled: boolean;
};

const prevStates = {};

const executionContext: ExecutionContext = {
  traces: {},
  enabled: false,
  newContext: () => {
    executionContext.currentExecution = new Execution();
    executionContext.traces[asyncHooks.executionAsyncId()] = executionContext.currentExecution;
    return executionContext.currentExecution;
  },
} as any;

function init(asyncId: number, _type: string, triggerAsyncId: number) {
  if (executionContext.traces[triggerAsyncId]) {
    executionContext.traces[asyncId] = executionContext.traces[triggerAsyncId];
  }
}

function before(asyncId: number) {
  if (!executionContext.traces[asyncId]) {
    return;
  }
  prevStates[asyncId] = executionContext.currentExecution;
  executionContext.currentExecution = executionContext.traces[asyncId];
}

function after(asyncId: number) {
  if (!executionContext.traces[asyncId]) {
    return;
  }
  executionContext.currentExecution = prevStates[asyncId];
}

function destroy(asyncId: number) {
  if (executionContext.traces[asyncId]) {
    delete executionContext.traces[asyncId];
    delete prevStates[asyncId];
  }
}

const hook = asyncHooks.createHook({
  init,
  before,
  after,
  destroy,
});

executionContext.enable = () => {
  executionContext.enabled = true;
  return hook.enable();
};

export { executionContext };
