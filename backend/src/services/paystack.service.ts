import crypto from "crypto";
import axios from "axios";
import { env } from "../config/env";
import { AppError } from "../utils/app-error";

const paystackClient = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json"
  }
});

type InitializePaystackPayload = {
  email: string;
  amount: number;
  reference: string;
  metadata: Record<string, unknown>;
  callbackUrl?: string;
  subaccountCode?: string;
  transactionCharge?: number;
  bearer?: "account" | "subaccount";
};

export type PaystackVerifyResponse = {
  status: boolean;
  data: {
    status: string;
    reference?: string;
    amount?: number;
    currency?: string;
    channel?: string;
    paid_at?: string;
    fees?: number;
    fees_breakdown?: Record<string, unknown>;
    [key: string]: unknown;
  };
};

type PaystackSubaccountPayload = {
  businessName: string;
  bankCode: string;
  accountNumber: string;
  percentageCharge?: number;
};

type PaystackRefundPayload = {
  transactionReference: string;
  amount?: number;
  currency?: string;
  customerNote?: string;
  merchantNote?: string;
};

const isLiveMode = () => env.PAYSTACK_MODE === "live" && Boolean(env.PAYSTACK_SECRET_KEY);

const getPaystackErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
};

export const verifyWebhookSignature = (rawBody: Buffer | string, signature?: string) => {
  if (!env.PAYSTACK_SECRET_KEY || !signature) {
    return false;
  }

  const payload = Buffer.isBuffer(rawBody) ? rawBody.toString("utf8") : rawBody;
  const hash = crypto.createHmac("sha512", env.PAYSTACK_SECRET_KEY).update(payload).digest("hex");
  return hash === signature;
};

export const initializePaystackPayment = async (payload: InitializePaystackPayload) => {
  console.log("[paystack] initializePaystackPayment start", {
    reference: payload.reference,
    email: payload.email,
    amount: payload.amount,
    callbackUrl: payload.callbackUrl ?? env.PAYSTACK_CALLBACK_URL,
    subaccountCode: payload.subaccountCode,
    transactionCharge: payload.transactionCharge,
    bearer: payload.bearer
  });

  if (!isLiveMode()) {
    console.log("[paystack] initializePaystackPayment mock mode returning mock response", {
      reference: payload.reference
    });
    return {
      authorizationUrl: "",
      accessCode: "",
      reference: payload.reference,
      mode: "mock" as const
    };
  }

  // Try with subaccount first, fallback to no subaccount if invalid
  let requestPayload: any = {
    email: payload.email,
    amount: payload.amount * 100,
    reference: payload.reference,
    callback_url: payload.callbackUrl ?? env.PAYSTACK_CALLBACK_URL,
    metadata: payload.metadata,
    transaction_charge: payload.transactionCharge ? payload.transactionCharge * 100 : undefined,
    bearer: payload.bearer ?? "account"
  };

  if (payload.subaccountCode) {
    requestPayload.subaccount = payload.subaccountCode;
  }

  try {
    const { data } = await paystackClient.post("/transaction/initialize", requestPayload);

    console.log("[paystack] initializePaystackPayment response", {
      reference: data.data.reference,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      usedSubaccount: Boolean(payload.subaccountCode)
    });

    return {
      authorizationUrl: data.data.authorization_url as string,
      accessCode: data.data.access_code as string,
      reference: data.data.reference as string,
      mode: "live" as const
    };
  } catch (error) {
    // If subaccount is invalid and we were trying to use one, retry without subaccount
    if (payload.subaccountCode && axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn("[paystack] initializePaystackPayment subaccount invalid, retrying without subaccount", {
        subaccountCode: payload.subaccountCode,
        error: error.response?.data
      });

      const retryPayload = { ...requestPayload };
      delete retryPayload.subaccount;
      delete retryPayload.transaction_charge;
      delete retryPayload.bearer;

      const { data } = await paystackClient.post("/transaction/initialize", retryPayload).catch((retryError) => {
        throw new AppError(
          getPaystackErrorMessage(retryError, "Paystack could not start this payment. Please try again."),
          502
        );
      });

      console.log("[paystack] initializePaystackPayment retry response (no subaccount)", {
        reference: data.data.reference,
        authorizationUrl: data.data.authorization_url,
        accessCode: data.data.access_code
      });

      return {
        authorizationUrl: data.data.authorization_url as string,
        accessCode: data.data.access_code as string,
        reference: data.data.reference as string,
        mode: "live" as const
      };
    }

    throw new AppError(getPaystackErrorMessage(error, "Paystack could not start this payment. Please try again."), 502);
  }
};

export const verifyPaystackPayment = async (reference: string) => {
  if (!isLiveMode()) {
    return {
      status: true,
      data: {
        status: "success",
        reference,
        amount: 0,
        currency: "NGN",
        channel: "mock"
      }
    } satisfies PaystackVerifyResponse;
  }

  const { data } = await paystackClient.get<PaystackVerifyResponse>(`/transaction/verify/${reference}`);
  return data;
};

export const listPaystackBanks = async () => {
  if (!isLiveMode()) {
    return [
      { name: "Access Bank", code: "044" },
      { name: "Guaranty Trust Bank", code: "058" },
      { name: "First Bank of Nigeria", code: "011" },
      { name: "United Bank for Africa", code: "033" }
    ];
  }

  const { data } = await paystackClient.get("/bank", {
    params: { country: "nigeria", currency: "NGN" }
  });

  return (data.data as Array<{ name: string; code: string; active?: boolean }>).filter(
    (bank) => bank.active !== false
  );
};

export const resolvePaystackAccount = async (accountNumber: string, bankCode: string) => {
  if (!isLiveMode()) {
    return {
      account_name: "Test Organizer",
      account_number: accountNumber,
      bank_id: Number(bankCode)
    };
  }

  try {
    const { data } = await paystackClient.get("/bank/resolve", {
      params: {
        account_number: accountNumber,
        bank_code: bankCode
      }
    });

    return data.data as {
      account_name: string;
      account_number: string;
      bank_id: number;
    };
  } catch (error) {
    throw new AppError(
      getPaystackErrorMessage(error, "We could not verify that bank account. Check the account number and bank."),
      400
    );
  }
};

export const createOrUpdatePaystackSubaccount = async (
  payload: PaystackSubaccountPayload,
  subaccountCode?: string
) => {
  if (!isLiveMode()) {
    return {
      id: 1,
      subaccount_code: subaccountCode || "ACCT_TEST_ORGANIZER",
      business_name: payload.businessName,
      settlement_bank: payload.bankCode,
      account_number: payload.accountNumber,
      account_name: "Test Organizer",
      percentage_charge: payload.percentageCharge ?? 0,
      settlement_schedule: "AUTO"
    };
  }

  if (subaccountCode) {
    const { data } = await paystackClient.put(`/subaccount/${subaccountCode}`, {
      business_name: payload.businessName,
      settlement_bank: payload.bankCode,
      account_number: payload.accountNumber,
      percentage_charge: payload.percentageCharge ?? 0
    });

    return data.data as {
      id: number;
      subaccount_code: string;
      business_name: string;
      settlement_bank: string;
      account_number: string;
      account_name: string;
      percentage_charge: number;
      settlement_schedule: string;
    };
  }

  const { data } = await paystackClient.post("/subaccount", {
    business_name: payload.businessName,
    settlement_bank: payload.bankCode,
    account_number: payload.accountNumber,
    percentage_charge: payload.percentageCharge ?? 0
  });

  return data.data as {
    id: number;
    subaccount_code: string;
    business_name: string;
    settlement_bank: string;
    account_number: string;
    account_name: string;
    percentage_charge: number;
    settlement_schedule: string;
  };
};

export const createPaystackRefund = async (payload: PaystackRefundPayload) => {
  if (!isLiveMode()) {
    return {
      id: Date.now(),
      status: "processed",
      amount: payload.amount ?? 0
    };
  }

  const { data } = await paystackClient.post("/refund", {
    transaction: payload.transactionReference,
    amount: payload.amount ? payload.amount * 100 : undefined,
    currency: payload.currency ?? "NGN",
    customer_note: payload.customerNote,
    merchant_note: payload.merchantNote
  });

  return data.data as {
    id: number;
    status: string;
    amount: number;
  };
};

export const fetchPaystackSettlementState = async (reference: string) => {
  const verification = await verifyPaystackPayment(reference);
  return {
    reference,
    status: verification.data.status,
    amount: (verification.data.amount ?? 0) / 100,
    currency: verification.data.currency ?? "NGN"
  };
};
