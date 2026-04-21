import { app } from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { registerQueueWorkers } from "./services/job-queue.service";
import { fulfillOrderTickets } from "./services/fulfillment.service";
import { processWebhookLog } from "./services/payment.service";
import { reconcileOrder } from "./services/reconciliation.service";
import { seedDatabase } from "./services/seed.service";
import { sendTicketConfirmationEmail } from "./services/email.service";

const startServer = async () => {
  await connectDatabase();

  registerQueueWorkers({
    "payment-webhook": {
      "process-webhook": async (payload) => {
        await processWebhookLog((payload as { webhookLogId: string }).webhookLogId);
      }
    },
    "ticket-fulfillment": {
      "fulfill-order": async (payload) => {
        await fulfillOrderTickets((payload as { orderId: string }).orderId);
      }
    },
    "email-delivery": {
      "ticket-confirmation": async (payload) => {
        await sendTicketConfirmationEmail(
          payload as {
            to: string;
            name: string;
            eventTitle: string;
            amount: number;
            qrCode: string;
          }
        );
      }
    },
    reconciliation: {
      "reconcile-order": async (payload) => {
        await reconcileOrder((payload as { orderId: string }).orderId);
      }
    }
  });

  if (env.SEED_ON_BOOT) {
    await seedDatabase();
  }

  app.listen(env.PORT, () => {
    console.log(`EventChimp API listening on http://localhost:${env.PORT}`);
    console.log(`Swagger docs available at http://localhost:${env.PORT}/api/docs`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start EventChimp backend", error);
  process.exit(1);
});
