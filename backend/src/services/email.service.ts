import { Resend } from "resend";
import { env } from "../config/env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

type OrderTicketEmailItem = {
  ticketCode: string;
  qrCode: string;
  ticketTypeName: string;
};

export type OrderConfirmationEmailPayload = {
  to: string;
  name: string;
  eventTitle: string;
  amount: number;
  eventUrl: string;
  tickets: OrderTicketEmailItem[];
};

export type OrganizerPurchaseEmailPayload = {
  to: string;
  organizerName: string;
  attendeeName: string;
  attendeeEmail: string;
  eventTitle: string;
  quantity: number;
  buyerTotal: number;
};

export type InvitationEmailPayload = {
  to: string;
  inviterName: string;
  eventTitle: string;
  role: "manager" | "scanner" | "viewer";
  acceptUrl: string;
};

const sendEmail = async (payload: {
  to: string;
  subject: string;
  html: string;
}) => {
  if (!resend) {
    return;
  }

  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: payload.to,
    subject: payload.subject,
    html: payload.html
  });
};

export const sendOrderConfirmationEmail = async (payload: OrderConfirmationEmailPayload) => {
  const ticketMarkup = payload.tickets
    .map(
      (ticket) => `
        <div style="border:1px solid #f0e8dc;border-radius:18px;padding:16px;margin-top:16px;">
          <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#7f6d62;">${ticket.ticketTypeName}</p>
          <p style="margin:8px 0 0;font-size:18px;font-weight:700;color:#171717;">${ticket.ticketCode}</p>
          <img src="${ticket.qrCode}" alt="Ticket QR code for ${ticket.ticketCode}" style="margin-top:14px;width:180px;height:180px;border-radius:12px;" />
        </div>
      `
    )
    .join("");

  await sendEmail({
    to: payload.to,
    subject: `Your EventChimp tickets for ${payload.eventTitle}`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; color: #111111; line-height: 1.6; max-width: 680px; margin: 0 auto;">
        <h1 style="font-size: 28px; margin-bottom: 12px;">You're in, ${payload.name}</h1>
        <p>Your ticket order for <strong>${payload.eventTitle}</strong> has been confirmed.</p>
        <p>Total paid: <strong>NGN ${payload.amount.toLocaleString()}</strong></p>
        <p>Open your event page anytime here: <a href="${payload.eventUrl}">${payload.eventUrl}</a></p>
        <div style="margin-top: 24px;">
          <h2 style="font-size: 20px; margin: 0 0 12px;">Your tickets</h2>
          ${ticketMarkup}
        </div>
      </div>
    `
  });
};

export const sendOrganizerPurchaseEmail = async (payload: OrganizerPurchaseEmailPayload) => {
  await sendEmail({
    to: payload.to,
    subject: `New ticket order for ${payload.eventTitle}`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; color: #111111; line-height: 1.6; max-width: 640px; margin: 0 auto;">
        <h1 style="font-size: 26px; margin-bottom: 12px;">Hi ${payload.organizerName},</h1>
        <p><strong>${payload.attendeeName}</strong> just completed a ticket purchase for <strong>${payload.eventTitle}</strong>.</p>
        <p>Buyer email: <strong>${payload.attendeeEmail}</strong></p>
        <p>Tickets purchased: <strong>${payload.quantity}</strong></p>
        <p>Buyer paid total: <strong>NGN ${payload.buyerTotal.toLocaleString()}</strong></p>
      </div>
    `
  });
};

export const sendInvitationEmail = async (payload: InvitationEmailPayload) => {
  const roleLabel = payload.role === "scanner" ? "scanner" : payload.role;
  await sendEmail({
    to: payload.to,
    subject: `You've been invited to join ${payload.eventTitle} on EventChimp`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; color: #111111; line-height: 1.6; max-width: 640px; margin: 0 auto;">
        <h1 style="font-size: 26px; margin-bottom: 12px;">EventChimp invitation</h1>
        <p>${payload.inviterName} invited you to join <strong>${payload.eventTitle}</strong> as a <strong>${roleLabel}</strong>.</p>
        <p>Use the button below to sign in or create an account, then accept the invitation.</p>
        <p style="margin-top: 24px;">
          <a href="${payload.acceptUrl}" style="display:inline-block;background:#ff5a1f;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700;">
            Accept invitation
          </a>
        </p>
      </div>
    `
  });
};
