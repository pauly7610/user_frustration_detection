import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'frustration-detector',
  brokers: [process.env.KAFKA_BROKER!],
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: process.env.KAFKA_USERNAME!,
    password: process.env.KAFKA_PASSWORD!
  }
});