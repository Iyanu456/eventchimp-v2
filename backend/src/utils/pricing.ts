import { env } from "../config/env";

export type PaymentPricingConfig = {
  preserveOrganizerRevenue: boolean;
  pricingMode: "buyer_pays_fee";
  transactionFeeModel: "paystack_ng";
  payoutCostModel: "transfer_band";
  stampDutyEnabled: boolean;
  platformMargin: {
    type: "flat" | "percent";
    value: number;
  };
};

export type PricingBreakdown = {
  ticketSubtotal: number;
  organizerNetAmount: number;
  estimatedTransactionFee: number;
  estimatedTransferFee: number;
  estimatedStampDuty: number;
  platformMargin: number;
  serviceFee: number;
  buyerTotal: number;
};

export const paymentPricingConfig: PaymentPricingConfig = {
  preserveOrganizerRevenue: true,
  pricingMode: "buyer_pays_fee",
  transactionFeeModel: "paystack_ng",
  payoutCostModel: "transfer_band",
  stampDutyEnabled: true,
  platformMargin: {
    type: env.PLATFORM_MARGIN_TYPE,
    value: env.PLATFORM_MARGIN_VALUE
  }
};

const roundMoney = (value: number) => Math.max(Math.ceil(value), 0);

export const calculatePaystackTransactionFee = (amount: number) => {
  const safeAmount = Math.max(amount, 0);
  const percentageFee = safeAmount * (env.PAYSTACK_TRANSACTION_PERCENT / 100);
  const flatFee =
    safeAmount < env.PAYSTACK_TRANSACTION_FLAT_FEE_WAIVER_THRESHOLD
      ? 0
      : env.PAYSTACK_TRANSACTION_FLAT_FEE;

  return Math.min(roundMoney(percentageFee + flatFee), env.PAYSTACK_TRANSACTION_FEE_CAP);
};

export const estimateTransferFee = (amount: number, settlementMode: "split_subaccount" | "manual_transfer") => {
  if (settlementMode === "split_subaccount" || amount <= 0) {
    return 0;
  }

  if (amount <= 5000) {
    return env.PAYSTACK_TRANSFER_FEE_BELOW_5000;
  }

  if (amount <= 50000) {
    return env.PAYSTACK_TRANSFER_FEE_BELOW_50000;
  }

  return env.PAYSTACK_TRANSFER_FEE_ABOVE_50000;
};

export const estimateStampDuty = (amount: number, settlementMode: "split_subaccount" | "manual_transfer") => {
  if (!paymentPricingConfig.stampDutyEnabled || settlementMode === "split_subaccount") {
    return 0;
  }

  return amount >= env.PAYSTACK_STAMP_DUTY_THRESHOLD ? env.PAYSTACK_STAMP_DUTY_AMOUNT : 0;
};

export const calculatePlatformMargin = (ticketSubtotal: number) => {
  if (paymentPricingConfig.platformMargin.type === "percent") {
    return roundMoney(ticketSubtotal * (paymentPricingConfig.platformMargin.value / 100));
  }

  return roundMoney(paymentPricingConfig.platformMargin.value);
};

export const calculatePricingBreakdown = (
  ticketSubtotal: number,
  settlementMode: "split_subaccount" | "manual_transfer" = "split_subaccount"
): PricingBreakdown => {
  const safeTicketSubtotal = roundMoney(ticketSubtotal);
  const organizerNetAmount = safeTicketSubtotal;
  const platformMargin = calculatePlatformMargin(safeTicketSubtotal);
  const estimatedTransferFee = estimateTransferFee(organizerNetAmount, settlementMode);
  const estimatedStampDuty = estimateStampDuty(organizerNetAmount, settlementMode);

  if (safeTicketSubtotal === 0) {
    return {
      ticketSubtotal: 0,
      organizerNetAmount: 0,
      estimatedTransactionFee: 0,
      estimatedTransferFee: 0,
      estimatedStampDuty: 0,
      platformMargin: 0,
      serviceFee: 0,
      buyerTotal: 0
    };
  }

  const basePlatformNeed = platformMargin + estimatedTransferFee + estimatedStampDuty;
  let serviceFee = basePlatformNeed;
  let safetyCounter = 0;

  while (safetyCounter < 20) {
    const buyerTotal = safeTicketSubtotal + serviceFee;
    const estimatedTransactionFee = calculatePaystackTransactionFee(buyerTotal);
    const requiredServiceFee = basePlatformNeed + estimatedTransactionFee;

    if (serviceFee >= requiredServiceFee) {
      return {
        ticketSubtotal: safeTicketSubtotal,
        organizerNetAmount,
        estimatedTransactionFee,
        estimatedTransferFee,
        estimatedStampDuty,
        platformMargin,
        serviceFee,
        buyerTotal
      };
    }

    serviceFee = requiredServiceFee;
    safetyCounter += 1;
  }

  const fallbackBuyerTotal = safeTicketSubtotal + serviceFee;
  return {
    ticketSubtotal: safeTicketSubtotal,
    organizerNetAmount,
    estimatedTransactionFee: calculatePaystackTransactionFee(fallbackBuyerTotal),
    estimatedTransferFee,
    estimatedStampDuty,
    platformMargin,
    serviceFee,
    buyerTotal: fallbackBuyerTotal
  };
};
