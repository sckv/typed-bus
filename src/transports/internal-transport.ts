import { Transport } from '../engine/transport';

export class InternalTransport extends Transport {
  name = 'internal';
  ready = true;
  waitForReady = false;
}
