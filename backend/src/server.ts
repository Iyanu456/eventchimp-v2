import { app } from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { registerQueueWorkers } from "./services/job-queue.service";
import { fulfillOrderTickets } from "./services/fulfillment.service";
import { processWebhookLog } from "./services/payment.service";
import { reconcileOrder } from "./services/reconciliation.service";
import { seedDatabase } from "./services/seed.service";
import {
  sendInvitationEmail,
  sendOrderConfirmationEmail,
  sendOrganizerPurchaseEmail
} from "./services/email.service";

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
      "order-confirmation": async (payload) => {
        await sendOrderConfirmationEmail(payload as Parameters<typeof sendOrderConfirmationEmail>[0]);
      },
      "organizer-purchase-notification": async (payload) => {
        await sendOrganizerPurchaseEmail(payload as Parameters<typeof sendOrganizerPurchaseEmail>[0]);
      },
      "event-invitation": async (payload) => {
        await sendInvitationEmail(payload as Parameters<typeof sendInvitationEmail>[0]);
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
