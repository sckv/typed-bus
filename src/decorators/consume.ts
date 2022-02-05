import 'reflect-metadata';
import * as iots from 'io-ts';

import { TypedBus } from '../engine/instance';

/**
 * Decorator @Consume(contract).
 * Consumes an event that matches the io-ts type.
 *
 * */
export function Consume<I extends iots.Any>(contract: I) {
  return (
    target: any,
    _propertyName: string,
    propertyDescriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    TypedBus.addConsumer(contract, propertyDescriptor.value.bind(target));

    return propertyDescriptor;
  };
}
