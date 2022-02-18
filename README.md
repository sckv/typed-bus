# Typed Event Bus

Based on `io-ts` types, this bus provides a handy interface to publish and consume events in the current runtime of the Node.js process.

Features:

- Versatile types by io-ts (nominal, branded, logical, shape types, etc)
- Listens to and publishes to any settled and instantiated transports
- Awaits for transport to be ready (async)
- Easy interface for the definition of the transports
- Tracks all events records (business operations chain)
- A shared bus for all the transports
- You can set what transport the consumer should be listening to (`listenTo`)
- You can explicitly set where the event is going to be published to (`onlySendTo`: [what transport])
- Hook into a response event with a determined contract (handy for HTTP requests that await for a response)

Soon:

- You can provide a source connector where all the orphan events can be dumped (e.g. NoSQL storage as Mongo)
- You can provide a source connector where all the consumed events can be dumped
- Handy Context API to tie the event with the business operation & aggregate mutation
- Rebuild the graph for any event from its unique ID and visualize it (and the data changes)

## Install

```bash
$ npm install typed-bus

...

$ yarn add typed-bus
```

## Glossary

- `event` - completely immutable, timestamped with unique ID payload and metadata that is being transported to the consumers
- `consumer` - ANY function that is added to a consumer's list and have a io-ts type shape for it's execution
- `transport` - an abstraction for connections internally or externally out of the system
- `typed-bus` - a bus engine that is in charge of creating Events from received payload to publish them to correct registered transports
- `orphanEvent` - an event that has been published into the bus and found no consumers that match it's shape within all the registered or/and selected transports, it goes to a separate list of orphan events, handy for debugging
- events are Immutable, pushed ONLY in a chronological order at level of transport and are de-duplicated

## Start using like this

```ts
import { TypedBus, Consume } from 'typed-bus';
import * as iots from 'io-ts';

class ConsumerTest {
  @Consume(iots.type({ amount: iots.number, currency: iots.string }))
  async justConsumer(data: any) {
    console.log('I just consumed money event', data);
  }

  // this method will be listening for the events only from `kafka` transport
  @Consume(iots.type({ name: iots.string, age: iots.number }, { listenTo: ['kafka'] }))
  async nameAgeConsumerCommand(data: any) {
    console.log('I just consumed person event', data);
  }
}

// somewhere instantiate the class with correct dependencies
new ConsumerTest();

// somewhere in the app call
await TypedBus.publish({ amount: 1234, currency: 'EUR' });
```

## You can add and remove consumers in runtime anywhere in the app

```ts
import { TypedBus, Consume } from 'typed-bus';
import * as iots from 'io-ts';

const TypeShapeToConsume = iots.type({ amount: iots.number, currency: iots.string });

let consumerId = {};
function consumerFunction(shape: iots.OutputOf<TypeShapeToConsume>) {
  // some logic, logging, etc
  ...

  // after that is done, if you want you can remove that consumer function
  TypedBus.removeConsumer(consumerId.id)
}

consumerId = TypedBus.addConsumer(TypeShapeToConsume, consumerFunction);

// anywhere in the app
TypedBus.publish({ amount: 1234, currency: 'EUR' })
```

## Wait for a hook resolution

```ts
import { TypedBus } from 'typed-bus';
import * as iots from 'io-ts';

class ExpressController {
  @Post()
  async addMoreMoney(req: Request, res: Response) {
    console.log('I just received http request to add more money with body', req.body);

    // this will wait 10 seconds for the event resolution
    const data = await TypedBus.publish(req.body, {
      hook: iots.type({ outcome: iots.literal('MONEY_ADDED'), account: iots.string }),
    });

    res.status(200).send(data);
  }
}

// somewhere instantiate the class with correct dependencies
new ExpressController();
```

## Define your transport

```ts
import { Consumer, Kafka, Producer } from 'kafkajs';
import * as iots from 'io-ts';

import { Transport, TypedBus } from 'typed-bus';

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

## If you want more control of your transport, you can implement \_publish method

```ts
import * as iots from 'io-ts';

import { Event, Transport, TypedBus } from 'typed-bus';

export class MyTransport extends Transport {
  name = 'another-transport';

  async _startAsyncTransport(): Promise<void> {
    // do some async instantiation if that is needed
    ...
  }

  async _publish(event: Event): {
    orphanEvent?: boolean;
    publishedConsumers: PromiseSettledResult<void>[];
  } {
    // do some checks and verifications
    // you have access to all internal API's of transport
    // such as `this.consumers` list that gives you a fine grained control
    // you can set custom rules that should be executed before the event is sent to the consumers
    ... custom control rules, logging, etc ...
  }
}
```
