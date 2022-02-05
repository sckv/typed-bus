import { TypedBusClass } from './typed-bus';

import { executionContext } from '../context/execution-context';

executionContext.enable();

export const TypedBus = new TypedBusClass();
