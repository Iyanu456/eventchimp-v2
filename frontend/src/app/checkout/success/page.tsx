import { CheckoutSuccessClient } from "@/components/checkout/checkout-success-client";
import { getApiUrl } from "@/lib/server-events";
import { getRequestErrorMessage } from "@/lib/utils";
import { ApiEnvelope } from "@/types/api";
import { Ticket, Transaction } from "@/types/domain";

export const metadata = {
  title: "Ticket purchase complete | EventChimp",
  description: "View and download your EventChimp tickets."
};

const firstQueryValue = (value?: string | string[]) => (Array.isArray(value) ? value[0] ?? "" : value ?? "");

export default async function CheckoutSuccessPage({
  searchParams
}: {
  searchParams?: {
    reference?: string | string[];
    trxref?: string | string[];
    event?: string | string[];
  };
}) {
  const reference = firstQueryValue(searchParams?.reference) || firstQueryValue(searchParams?.trxref);
  const eventSlug = firstQueryValue(searchParams?.event);
  let initialResult: { transaction: Transaction; tickets: Ticket[] } | null = null;
  let initialError: string | null = null;

  if (reference) {
    try {
      const response = await fetch(`${getApiUrl()}/payments/verify/${encodeURIComponent(reference)}`, {
        cache: "no-store"
      });
      const payload = (await response.json()) as ApiEnvelope<{
        transaction: Transaction;
        tickets: Ticket[];
      }>;

      if (!response.ok || !payload.success) {
        initialError = payload.message || "We could not confirm this ticket purchase yet.";
      } else {
        initialResult = payload.data;
      }
    } catch (error) {
      initialError = getRequestErrorMessage(error, "We could not confirm this ticket purchase yet.");
    }
  } else {
    initialError = "We could not find the checkout reference for this purchase.";
  }

  return (
    <CheckoutSuccessClient
      reference={reference}
      eventSlug={eventSlug}
      initialResult={initialResult}
      initialError={initialError}
    />
  );
}
