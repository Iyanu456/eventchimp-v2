export const serializeOrderToTransactionView = (order: {
  _id: { toString: () => string };
  providerReference: string;
  quantity: number;
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
  ticketTypeId: string;
  ticketTypeName: string;
  attendeeFirstName: string;
  attendeeLastName: string;
  attendeeEmail: string;
  attendeePhone: string;
  comment: string;
  customAnswers: Array<{ fieldId: string; label: string; value: string }>;
  paymentStatus: string;
  fulfillmentStatus: string;
  settlementStatus: string;
  createdAt: Date;
  eventId?: unknown;
  organizerId?: unknown;
}) => {
  const eventValue = order.eventId as { _id?: { toString: () => string }; title?: string } | undefined;
  const organizerValue = order.organizerId as { _id?: { toString: () => string }; name?: string } | undefined;
  const event =
    eventValue && typeof eventValue === "object"
      ? { _id: String(eventValue._id), title: eventValue.title ?? "Event ticket" }
      : undefined;
  const organizer =
    organizerValue && typeof organizerValue === "object"
      ? { id: String(organizerValue._id ?? ""), name: organizerValue.name ?? "" }
      : undefined;

  return {
    _id: String(order._id),
    providerReference: order.providerReference,
    amount: order.pricing.buyerTotal,
    quantity: order.quantity,
    ticketPrice: order.pricing.ticketSubtotal,
    serviceFee: order.pricing.serviceFee,
    organizerShare: order.pricing.organizerNetAmount,
    platformRevenue:
      order.pricing.serviceFee -
      order.pricing.estimatedTransactionFee -
      order.pricing.estimatedTransferFee -
      order.pricing.estimatedStampDuty,
    estimatedTransactionFee: order.pricing.estimatedTransactionFee,
    estimatedTransferFee: order.pricing.estimatedTransferFee,
    estimatedStampDuty: order.pricing.estimatedStampDuty,
    platformMargin: order.pricing.platformMargin,
    buyerTotal: order.pricing.buyerTotal,
    organizerNetAmount: order.pricing.organizerNetAmount,
    ticketSubtotal: order.pricing.ticketSubtotal,
    ticketTypeId: order.ticketTypeId,
    ticketTypeName: order.ticketTypeName,
    attendeeFirstName: order.attendeeFirstName,
    attendeeLastName: order.attendeeLastName,
    attendeeEmail: order.attendeeEmail,
    attendeePhone: order.attendeePhone,
    comment: order.comment,
    customAnswers: order.customAnswers,
    status:
      order.paymentStatus === "paid"
        ? "success"
        : order.paymentStatus === "refunded"
          ? "refunded"
          : order.paymentStatus === "failed"
            ? "failed"
            : "pending",
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    settlementStatus: order.settlementStatus,
    createdAt: order.createdAt,
    eventId: event,
    organizerId: organizer
  };
};
