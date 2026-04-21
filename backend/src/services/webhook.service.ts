import { enqueueJob } from "./job-queue.service";
import { createWebhookLog, processWebhookLog } from "./payment.service";

export const receivePaystackWebhook = async (payload: unknown, rawBody: Buffer, signature?: string) => {
  const webhookLog = await createWebhookLog(payload, rawBody, signature);

  if (webhookLog.verified) {
    await enqueueJob(
      "payment-webhook",
      "process-webhook",
      { webhookLogId: webhookLog._id.toString() },
      async (jobPayload: { webhookLogId: string }) => {
        await processWebhookLog(jobPayload.webhookLogId);
      },
      `webhook:${webhookLog.dedupeKey}`
    );
  }

  return webhookLog;
};
