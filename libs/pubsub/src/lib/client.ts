import { Kafka } from 'kafkajs';

const brokers = process.env.KAFKA_BROKERS?.split(',') as string[];

export const client = new Kafka({
  clientId: 'pms',
  brokers,
});
