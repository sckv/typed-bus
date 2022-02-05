import * as iots from 'io-ts';
import { fold } from 'fp-ts/lib/Either';

import { reporter } from './reporter';

/**
 *
 * @param contract - an io-ts contract to check against
 * @param input - an input data
 * @param stripUnknown `boolean` - default `false` - strip all the data not in the contract for the output value
 * @param fail `boolean`- default `true` - throw error or return just error instance
 */
export function validate<T, O, I>({
  contract,
  input,
  stripUnknown = false,
}: {
  contract: iots.Type<T, O, I>;
  input: T;
  stripUnknown?: boolean;
  fail?: boolean;
}): T {
  const result = stripUnknown
    ? (iots.exact(contract as any) as iots.Type<T, O, I>).decode(input as unknown as I)
    : contract.decode(input as unknown as I);

  return fold<iots.Errors, T, T>(
    () => {
      const errors = reporter(result);
      // const errorInstance = new Error(input, contract.name, errors);

      // if (fail) throw errorInstance;
      // return errorInstance;
      return errors;
    },
    (value) => value,
  )(result);
}

const contract = iots.type({
  uuid: iots.string,
  timestamp: iots.number,
});

console.log(validate({ contract, input: { name: 4 as any, age: 'dasdfasd' as any } as any }));
