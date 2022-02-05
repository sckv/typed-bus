import * as array from 'fp-ts/lib/Array';
import { fold } from 'fp-ts/lib/Either';
import { map, Option, toNullable } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import * as t from 'io-ts';

const jsToString = (value: unknown) => (value === undefined ? 'undefined' : JSON.stringify(value));

export const formatValidationError = (error: t.ValidationError) => {
  const path = error.context
    .map((c) => c.key)
    // The context entry with an empty key is the original type ("default
    // context"), not an type error.
    .filter((key) => key.length > 0);

  // The actual error is last in context
  const maybeErrorContext = array.last(
    // https://github.com/gcanti/fp-ts/pull/544/files
    error.context as any as t.ContextEntry[],
  );

  return pipe(
    maybeErrorContext,
    map((errorContext: any) => {
      const expectedType = errorContext.type.name;
      const fullPathName = path.filter((p) => Number.isNaN(+p)).join('.');
      return [
        // https://github.com/elm-lang/core/blob/18c9e84e975ed22649888bfad15d1efdb0128ab2/src/Native/Json.js#L199
        // tslint:disable-next-line:prefer-template
        fullPathName,
        expectedType,
        jsToString(error.value),
      ];
    }),
  );
};

const combineErrors = (
  acc: {
    [k: string]: {
      expected: string[];
      received: string;
    };
  },
  option: Option<any[]>,
) => {
  const isOk = toNullable(option);
  if (isOk) {
    const [pathName, expected, received] = isOk;

    const exist = acc[pathName];

    if (!exist) acc[pathName] = { received, expected: [expected] };
    else {
      acc[pathName].expected = exist.expected.concat(expected);
    }
  }

  return acc;
};

export const reporter = <T>(validation: t.Validation<T>) =>
  pipe(
    validation,
    fold(
      (errors) =>
        Object.entries(errors.map(formatValidationError).reduce(combineErrors, {})).reduce(
          (acc, data) => {
            const [path, contextData] = data as any as [
              string,
              { received: string; expected: string[] },
            ];
            const expected = contextData.expected.join(' | ').replace(/"/gi, '');
            const received = contextData.received.replace(/"/gi, '');
            acc[path] = 'Expected: ' + expected + ' type - received: ' + received;
            return acc as any;
          },
          {} as { [k: string]: string },
        ) as any,
      () => [],
    ),
  );
