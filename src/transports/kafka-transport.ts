import { Consumer, Kafka, Producer } from 'kafkajs';

import { Event } from '../engine/event';
import { Transport } from '../engine/transport';

export class KafkaTransport extends Transport {
  name = 'kafka';

  producer!: Producer;
  consumer!: Consumer;

  kafka: Kafka;

  constructor() {
    super();
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

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        this.publish(Event.create({ topic, partition, message, fromKafka: true }));
      },
    });
  }

  async _publish(event: Event): Promise<{
    orphanEvent?: boolean;
    publishedConsumers: PromiseSettledResult<void>[];
  }> {
    const publishedConsumers: any[] = [];

    // this is how we understand that the messages sent should be into kafka
    // All events payload with {topic, messages...}
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
