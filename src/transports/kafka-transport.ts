import { Consumer as KafkaConsumer, Kafka, Producer } from 'kafkajs';

import { Event } from '../engine/event';
import { Transport } from '../engine/transport';

class KafkaTransport extends Transport {
  name = 'kafka';

  producer!: Producer;
  consumer!: KafkaConsumer;

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
        const event = Event.create({ topic, partition, message });
        for (const consumer of this.consumers) {
          const okOrError = consumer.matchEvent(event);
          if (okOrError === true) {
            consumer.exec(event.payload);
          } else {
            if (Object.keys(okOrError).length < 2) {
              console.log(okOrError);
              console.log(
                `Event just have 1 error, maybe there's a malformed object for a consumer ${consumer.exec.name} with type ${consumer.contract.name}`,
              );
            }
          }
        }
      },
    });
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
