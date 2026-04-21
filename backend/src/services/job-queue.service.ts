import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { env } from "../config/env";

type QueueName =
  | "payment-webhook"
  | "ticket-fulfillment"
  | "email-delivery"
  | "reconciliation";

type QueueHandlerMap = Record<string, (payload: unknown) => Promise<void>>;

const isQueueEnabled = Boolean(env.REDIS_URL);
const queues = new Map<QueueName, Queue>();
let connection: IORedis | null = null;
let workersStarted = false;

const getConnection = () => {
  if (!env.REDIS_URL) {
    throw new Error("REDIS_URL is not configured");
  }

  if (!connection) {
    connection = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null
    });
  }

  return connection;
};

const getQueue = (name: QueueName) => {
  const existing = queues.get(name);
  if (existing) {
    return existing;
  }

  const queue = new Queue(name, { connection: getConnection() });
  queues.set(name, queue);
  return queue;
};

export const enqueueJob = async <TPayload>(
  queueName: QueueName,
  jobName: string,
  payload: TPayload,
  inlineHandler: (payload: TPayload) => Promise<void>,
  jobId?: string
) => {
  if (!isQueueEnabled) {
    await inlineHandler(payload);
    return;
  }

  await getQueue(queueName).add(jobName, payload as unknown as Record<string, unknown>, {
    attempts: 3,
    removeOnComplete: 100,
    removeOnFail: 100,
    jobId
  });
};

export const registerQueueWorkers = (handlers: Record<QueueName, QueueHandlerMap>) => {
  if (!isQueueEnabled || workersStarted) {
    return;
  }

  (Object.entries(handlers) as Array<[QueueName, QueueHandlerMap]>).forEach(([queueName, queueHandlers]) => {
    new Worker(
      queueName,
      async (job) => {
        const handler = queueHandlers[job.name];
        if (!handler) {
          return;
        }

        await handler(job.data);
      },
      {
        connection: getConnection()
      }
    );
  });

  workersStarted = true;
};
