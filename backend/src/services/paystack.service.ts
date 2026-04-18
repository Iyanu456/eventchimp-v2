import axios from "axios";
import { env } from "../config/env";

type InitializePaystackPayload = {
  email: string;
  amount: number;
  reference: string;
  metadata: Record<string, unknown>;
};

type VerifyPaystackResponse = {
  status: boolean;
  data: {
    status: string;
    reference?: string;
  };
};

export const initializePaystackPayment = async (payload: InitializePaystackPayload) => {
  if (!env.PAYSTACK_SECRET_KEY) {
    return {
      authorizationUrl: "",
      accessCode: "",
      reference: payload.reference,
      mode: "mock" as const
    };
  }

  const { data } = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: payload.email,
      amount: payload.amount * 100,
      reference: payload.reference,
      callback_url: env.PAYSTACK_CALLBACK_URL,
      metadata: payload.metadata
    },
    {
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return {
    authorizationUrl: data.data.authorization_url as string,
    accessCode: data.data.access_code as string,
    reference: data.data.reference as string,
    mode: "live" as const
  };
};

export const verifyPaystackPayment = async (reference: string) => {
  if (!env.PAYSTACK_SECRET_KEY) {
    return {
      status: true,
      data: {
        status: "success",
        reference
      }
    } satisfies VerifyPaystackResponse;
  }

  const { data } = await axios.get<VerifyPaystackResponse>(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`
      }
    }
  );

  return data;
};
