import { ClientSession } from "mongoose";
import { LedgerEntryModel } from "../models/LedgerEntry";

export const recordPaymentLedgerEntries = async (
  order: {
    _id: { toString: () => string };
    eventId: unknown;
    organizerId: unknown;
    purchaserId?: unknown;
    providerReference: string;
    currency: string;
    pricing: {
      buyerTotal: number;
      ticketSubtotal: number;
      serviceFee: number;
      organizerNetAmount: number;
      estimatedTransactionFee: number;
      estimatedTransferFee: number;
      estimatedStampDuty: number;
      platformMargin: number;
    };
    settlementStatus: string;
  },
  session?: ClientSession
) => {
  const basePayload = {
    orderId: order._id,
    eventId: order.eventId,
    organizerId: order.organizerId,
    purchaserId: order.purchaserId,
    reference: order.providerReference,
    currency: order.currency,
    grossAmount: order.pricing.buyerTotal,
    ticketSubtotal: order.pricing.ticketSubtotal,
    serviceFee: order.pricing.serviceFee,
    organizerNet: order.pricing.organizerNetAmount,
    estimatedCosts: {
      estimatedTransactionFee: order.pricing.estimatedTransactionFee,
      estimatedTransferFee: order.pricing.estimatedTransferFee,
      estimatedStampDuty: order.pricing.estimatedStampDuty,
      platformMargin: order.pricing.platformMargin
    }
  };

  await LedgerEntryModel.updateOne(
    { orderId: order._id, entryType: "payment_received" },
    {
      $setOnInsert: {
        ...basePayload,
        entryType: "payment_received",
        settlementStatus: order.settlementStatus,
        note: "Buyer payment verified"
      }
    },
    { upsert: true, session }
  );

  await LedgerEntryModel.updateOne(
    { orderId: order._id, entryType: "platform_fee_accrued" },
    {
      $setOnInsert: {
        ...basePayload,
        entryType: "platform_fee_accrued",
        grossAmount: order.pricing.serviceFee,
        ticketSubtotal: 0,
        organizerNet: 0,
        settlementStatus: order.settlementStatus,
        note: "Platform service fee accrued"
      }
    },
    { upsert: true, session }
  );
};

export const recordRefundLedgerEntry = async (
  order: {
    _id: { toString: () => string };
    eventId: unknown;
    organizerId: unknown;
    purchaserId?: unknown;
    providerReference: string;
    currency: string;
    pricing: {
      ticketSubtotal: number;
      organizerNetAmount: number;
    };
  },
  amount: number,
  note: string,
  session?: ClientSession
) => {
  await LedgerEntryModel.create(
    [
      {
        orderId: order._id,
        eventId: order.eventId,
        organizerId: order.organizerId,
        purchaserId: order.purchaserId,
        entryType: "refund_issued",
        reference: `${order.providerReference}-refund-${Date.now()}`,
        currency: order.currency,
        grossAmount: -Math.abs(amount),
        ticketSubtotal: -Math.abs(order.pricing.ticketSubtotal),
        serviceFee: 0,
        organizerNet: -Math.abs(order.pricing.organizerNetAmount),
        estimatedCosts: {
          estimatedTransactionFee: 0,
          estimatedTransferFee: 0,
          estimatedStampDuty: 0,
          platformMargin: 0
        },
        settlementStatus: "refunded",
        note
      }
    ],
    { session }
  );
};
