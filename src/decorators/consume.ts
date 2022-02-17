import 'reflect-metadata';
import * as iots from 'io-ts';

import { TypedBus } from '../engine/instance';

/**
 * Decorator `@Consume(contract, combine?: { with, name })`.
 * Consumes an event that matches the io-ts type.
 *
 * */
export function Consume<I extends iots.Any>(
  contract: I,
  options: {
    listenTo?: string[];
    combine?: {
      with: iots.Any;
      name: string;
    };
  } = {},
) {
  return (
    target: any,
    _propertyName: string,
    propertyDescriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const rightContract = options?.combine
      ? iots.intersection([contract, options.combine.with], options.combine.name)
      : contract;

    TypedBus.addConsumer(rightContract, propertyDescriptor.value, {
      listenTo: options.listenTo,
    });

    return propertyDescriptor;
  };
}
