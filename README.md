# Typed Event Bus

Based on `io-ts` types, this bus provides a handy interface to publish and consume events in the current runtime of the Node.js process.

Features:

- Listens from and publishes to any settled transports
- Easy interface for the transports definition

## Start using like this

```ts
import { TypedBus } from 'typed-bus';
import * as iots from 'io-ts';

class ConsumerTest {
  @Consume(iots.type({ amount: iots.number, currency: iots.string }))
  async justConsumer(data: any) {
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
import { TypedBus, Transport, Consumer } from 'typed-bus';
import { Kafka } from 'kafkajs';

class MyTransport extends Transport {
  name = 'kafka';

  kafka: Kafka;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'my-app',
      brokers: ['kafka1:9092', 'kafka2:9092'],
    });
  }

  async _startAsyncTransport(): Promise<void> {
    this.producer = this.kafka.producer();
    await this.producer.connect();

    this.consumer = this.kafka.consumer({ groupId: 'test-group' });
    await this.consumer.connect();

    await this.consumer.subscribe({ topic: 'test-topic' /** more settings from kafkajs */ });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        for (const consumer of this.consumers) {
          const decode = consumer.contract.decode(event);
          if (!isLeft(decode)) {
            publishedConsumers.push(consumer.fn(event.payload));
          } else {
            if (Object.keys(decode.left).length < 2) {
              console.log(reporter(decode));
              console.log(
                `Event just have 1 error, maybe there's a malformed object for a consumer ${consumer.fn.name} with type ${consumer.contract.name}`,
              );
            }
          }
        }
      },
    });
  }

  _addConsumer(contract: iots.Any, fn: () => any): void | Promise<void> {
    this.consumers.push({ contract, fn });
  }

  async _publish(event: Event): Promise<{
    orphanEvent?: boolean;
    publishedConsumers: PromiseSettledResult<void>[];
  }> {
    const { topic, messages } = event.payload;

    await this.producer.send({ topic, messages });

    return {
      orphanEvent: false,
      publishedConsumers: await Promise.allSettled([topic]),
    };
  }
}
```
