import { client } from './client';

export async function subscribe(
  topic: string,
  handler: (data: any) => Promise<void>
) {
  const consumer = client.consumer({ groupId: `${topic}-group` });

  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value!.toString());
      await handler(data);
    },
  });
}
