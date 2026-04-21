import { OrderModel } from "../models/Order";
import { AppError } from "../utils/app-error";
import { fetchPaystackSettlementState } from "./paystack.service";

export const reconcileOrder = async (orderId: string) => {
  const order = await OrderModel.findById(orderId);
  if (!order) {
    throw new AppError("Order not found for reconciliation", 404);
  }

  if (order.paymentStatus !== "paid") {
    return order;
  }

  const providerState = await fetchPaystackSettlementState(order.providerReference);
  const isAmountMatch = providerState.amount === order.pricing.buyerTotal;
  const isCurrencyMatch = providerState.currency === order.currency;
  const isStatusMatch = providerState.status === "success";

  order.settlementStatus = isAmountMatch && isCurrencyMatch && isStatusMatch ? "reconciled" : "mismatch";
  await order.save();

  return order;
};
