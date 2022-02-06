# Typed Event Bus

Based on `io-ts` types, this bus provides a handy interface to publish and consume events in the current runtime of the Node.js process.

Features:

- Listens from and publishes to any settled transports
- Easy interface for the transports definition
- Tracks all events record (business operations chain)
- Shared bus for all transports defined
- Can exclude transports where to publish

## Install

```bash
$ npm install typed-bus

...

$ yarn add typed-bus
```

## Start using like this

```ts
import { TypedBus } from 'typed-bus';
import * as iots from 'io-ts';

class ConsumerTest {
  @Consume(iots.type({ amount: iots.number, currency: iots.string }))
  async justConsumer(data: any) {
    console.log('I just consumed money event', data);
  }

  // this method wont be listening to events what came from `kafka` transport
  @Consume(iots.type({ name: iots.string, age: iots.number }, { dontListenTo: ['kafka'] }))
  async nameAgeConsumerCommand(data: any) {
    console.log('I just consumed money event', data);
  }
}

// somewhere instantiate the class with correct dependencies
new ConsumerTest();

// somewhere in the app call
await TypedBus.publish({ amount: 1234, currency: 'EUR' });
```

## Define your transport

```ts
import { Consumer, Kafka, Producer } from 'kafkajs';

import { Event, Transport } from 'typed-bus';

export class KafkaTransport extends Transport {
  name = 'kafka';

  producer!: Producer;
  consumer!: Consumer;
  kafka!: Kafka;

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
        // we get the data from Kafka and publish it for internal consumer methods
        await this._publish(
          Event.create({ topic, partition, message, fromKafka: true /** IMPORTANT */ }),
        );
      },
    });
  }

  async _publish(event: Event): Promise<{
    orphanEvent?: boolean;
    publishedConsumers: PromiseSettledResult<void>[];
  }> {
    const publishedConsumers: any[] = [];

    // this is how we understand that the messages sent should be into kafka
    // All events payload with { topic, messages... }
    // NOTE: important having `fromKafka` property to know if the event was received from kafka
    if (
      !event.payload.fromKafka &&
      event.payload.topic &&
      event.payload.messages &&
      event.payload.messages instanceof Array
    ) {
      publishedConsumers.push(this.producer.send(event.payload));
    }

    publishedConsumers.push(
      ...this.consumers.map(async (consumer) => {
        const okOrError = consumer.matchEvent(event);
        if (okOrError === 'ok') {
          await consumer.exec(event.payload);
        } else {
          if (Object.keys(okOrError).length < 2) {
            console.log(okOrError);
            console.log(
              `Event just have 1 error, maybe there's a malformed object for a consumer ${consumer.exec.name} with type ${consumer.contract.name}`,
            );
          }
        }
      }),
    );

    return {
      orphanEvent: false,
      publishedConsumers: await Promise.allSettled(publishedConsumers),
    };
  }
}
```
