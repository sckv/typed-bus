# Typed Event Bus

Based on `io-ts` types, this bus provides a handy interface to publish and consume events in the current runtime of the Node.js process.

Features:

- Versatile types by io-ts (nominal, branded, logical, shape types, etc)
- Listens from and publishes to any settled and instantiated transports
- Awaits for transport to be ready (async)
- Easy interface for the definition of the transports
- Tracks all events records (business operations chain)
- A shared bus for all the transports
- You can set what transport the consumer should be listening to (`listenTo`)
- You can explicitly where the event is going to be published to (`onlySendTo`: [what transport])

Soon:

- You can provide a source connector where all the orphan events can be dumped (e.g. NoSQL storage as Mongo)
- You can provide a source connector where all the consumed events can be dumped
- Handy Context API to tie the event with the business operation & aggregate mutation
- Rebuild the graph for any event from its unique ID and visualize it (and the data changes)
- Hook into a response event with a determined contract (handy for HTTP requests that await for a response)

## Install

```bash
$ npm install typed-bus

...

$ yarn add typed-bus
```

## Start using like this

```ts
import { TypedBus, Consume } from 'typed-bus';
import * as iots from 'io-ts';

class ConsumerTest {
  @Consume(iots.type({ amount: iots.number, currency: iots.string }))
  async justConsumer(data: any) {
    console.log('I just consumed money event', data);
  }

  // this method wont be listening to events what came from `kafka` transport
  @Consume(iots.type({ name: iots.string, age: iots.number }, { dontListenTo: ['kafka'] }))
  async nameAgeConsumerCommand(data: any) {
    console.log('I just consumed person event', data);
  }
}

// somewhere instantiate the class with correct dependencies
new ConsumerTest();

// somewhere in the app call
await TypedBus.publish({ amount: 1234, currency: 'EUR' });
```

## Wait for a hook resolution

```ts
import { TypedBus, Consume } from 'typed-bus';
import * as iots from 'io-ts';

class ExpressController {
  @Post()
  async addMoreMoney(req: Request, res: Response) {
    console.log('I just received http request to add more money with body', req.body);

    // this will wait 10 second for the event resolution
    const data = await TypedBus.publish(req.body, {
      hook: iots.type({ outcome: iots.literal('MONEY_ADDED'), account: iots.string }),
    });

    res.status(200).send(data);
  }
}

// somewhere instantiate the class with correct dependencies
new ConsumerTest();

// somewhere in the app call
```

## Define your transport

```ts
import { Consumer, Kafka, Producer } from 'kafkajs';
import * as iots from 'io-ts';

import { Event, Transport, TypedBus } from 'typed-bus';

const KafkaSendMessagePattern = iots.type({
  topic: iots.string,
  messages: iots.array(
    iots.type({
      key: iots.string,
      value: iots.unknown,
      headers: iots.unknown,
    }),
  ),
});

export class KafkaTransport extends Transport {
  name = 'kafka';

  producer!: Producer;
  consumer!: Consumer;
  kafka!: Kafka;

  // those are the default values for the transport class
  // as kafka is an async transport, we can omit this exact definitions
  ready = false;
  waitForReady = true;

  async _startAsyncTransport(): Promise<void> {
    // we start all the kafka connections
    this.kafka = new Kafka({
      clientId: 'my-app',
      brokers: ['kafka1:9092', 'kafka2:9092'],
    });

    this.producer = this.kafka.producer();
    await this.producer.connect();

    this.consumer = this.kafka.consumer({ groupId: 'test-group' });
    await this.consumer.connect();

    await this.consumer.subscribe({ topic: 'test-topic' /** more settings from kafkajs */ });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        // we hook into the data from Kafka and publish it into the internal bus
        // so we avoid resending received messages by any error in 'kafka' transport lane
        await TypedBus.publish({ topic, partition, message }, { onlySendTo: ['internal'] });
      },
    });

    // we declare a unique consumer for this 'kafka' transport
    // which is the actual producer.push method
    // as we dont control where it goes from our system
    TypedBus.addConsumer(KafkaSendMessagePattern, this.producer.push.bind(this.producer), {
      listenTo: ['kafka'],
    });
  }
}
```
