import { Resend } from "resend";
import { env } from "../config/env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

type TicketEmailPayload = {
  to: string;
  name: string;
  eventTitle: string;
  amount: number;
  qrCode: string;
};

export const sendTicketConfirmationEmail = async (payload: TicketEmailPayload) => {
  if (!resend) {
    return;
  }

  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: payload.to,
    subject: `Your EventChimp ticket for ${payload.eventTitle}`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; color: #111111; line-height: 1.6;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">You're in, ${payload.name}</h1>
        <p>Your ticket for <strong>${payload.eventTitle}</strong> has been confirmed.</p>
        <p>Total paid: <strong>NGN ${payload.amount.toLocaleString()}</strong></p>
        <p>Present this QR code at check-in:</p>
        <img src="${payload.qrCode}" alt="Ticket QR code" style="width: 200px; height: 200px;" />
      </div>
    `
  });
};
