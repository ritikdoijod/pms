import { client } from './client';

let isConnected = false;

const producer = client.producer();

export async function publish(topic: string, message: any) {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
  }

  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
}
