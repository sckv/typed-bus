import * as iots from 'io-ts';

export const EventBaseType = iots.type({
  uuid: iots.string,
  timestamp: iots.number,
});
