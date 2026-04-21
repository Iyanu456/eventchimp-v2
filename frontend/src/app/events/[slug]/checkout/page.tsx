"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ChevronLeft, LoaderCircle, LockKeyhole, Ticket } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { request } from "@/apiServices/requests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEventQuery } from "@/hooks/queries/use-events-query";
import { useAppMutations } from "@/hooks/mutations/use-app-mutations";
import { queryKeys } from "@/lib/query-keys";
import { useSessionStore } from "@/stores/session-store";
import { formatCurrency, getRequestErrorMessage } from "@/lib/utils";

export default function EventCheckoutPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useSessionStore((state) => state.currentUser);
  const { data, isLoading } = useEventQuery(params.slug);
  const { initializeCheckout, verifyCheckout } = useAppMutations();
  const paymentReference = searchParams.get("reference");

  const defaultNames = useMemo(() => {
    const parts = (currentUser?.name ?? "").trim().split(" ").filter(Boolean);
    return {
      firstName: parts[0] ?? "",
      lastName: parts.slice(1).join(" ")
    };
  }, [currentUser?.name]);

  const [ticketTypeId, setTicketTypeId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [firstName, setFirstName] = useState(defaultNames.firstName);
  const [lastName, setLastName] = useState(defaultNames.lastName);
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    setFirstName((current) => current || defaultNames.firstName);
    setLastName((current) => current || defaultNames.lastName);
    setEmail((current) => current || currentUser?.email || "");
  }, [currentUser?.email, defaultNames.firstName, defaultNames.lastName]);

  useEffect(() => {
    if (!paymentReference || verifyCheckout.isPending || verifyCheckout.isSuccess) {
      return;
    }

    verifyCheckout
      .mutateAsync({ reference: paymentReference })
      .then(() => {
        router.replace(currentUser ? "/dashboard/tickets" : `/events/${params.slug}`);
      })
      .catch((error) => {
        setCheckoutError(getRequestErrorMessage(error, "We couldn't confirm that payment yet. Please try again."));
      });
  }, [currentUser, params.slug, paymentReference, router, verifyCheckout]);

  const event = data?.event;
  const ticketTiers = useMemo(
    () => [...(event?.ticketTiers ?? [])].sort((a, b) => a.order - b.order),
    [event?.ticketTiers]
  );

  const selectedTier = useMemo(() => {
    const fallbackId = ticketTypeId || ticketTiers[0]?.id;
    return ticketTiers.find((tier) => tier.id === fallbackId) ?? ticketTiers[0];
  }, [ticketTiers, ticketTypeId]);

  const { data: pricing } = useQuery({
    queryKey: queryKeys.events.detail(`${params.slug}:quote:${selectedTier?.id ?? "none"}:${quantity}`),
    queryFn: async () =>
      (
        await request.getPaymentQuote({
          eventId: event!._id,
          ticketTypeId: selectedTier!.id,
          quantity
        })
      ).data,
    enabled: Boolean(event?._id && selectedTier?.id)
  });

  if (isLoading || !event) {
    return <div className="page-shell py-24 text-sm text-muted">Loading checkout...</div>;
  }

  if (!ticketTiers.length || !selectedTier) {
    return (
      <div className="page-shell py-16">
        <EmptyState title="No ticket types available" description="The organizer has not published ticket options for this event yet." />
      </div>
    );
  }

  return (
    <div className="page-shell py-10">
      <div className="mb-6">
        <Link href={`/events/${event.slug}`} className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink">
          <ChevronLeft className="h-4 w-4" />
          Back to event
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="surface-panel p-6">
          <div className="border-b border-line/80 pb-5">
            <Badge tone="default" className="bg-[#f5effd] text-[#6d2bb3]">
              Checkout
            </Badge>
            <h1 className="font-display mt-4 text-[2.1rem] font-semibold tracking-[-0.05em] text-ink">
              Complete your ticket details
            </h1>
            <p className="mt-2 text-sm leading-7 text-muted">
              Choose the ticket tier, tell the organizer who is coming, and review the total before heading to payment.
            </p>
          </div>

          <form
            className="mt-6 space-y-6"
            onSubmit={async (submitEvent) => {
              submitEvent.preventDefault();
              setCheckoutError(null);

              try {
                const initialized = await initializeCheckout.mutateAsync({
                  eventId: event._id,
                  ticketTypeId: selectedTier.id,
                  quantity,
                  attendeeFirstName: firstName,
                  attendeeLastName: lastName,
                  attendeeEmail: email,
                  attendeePhone: phone,
                  comment,
                  customAnswers: event.customFields
                    .map((field) => ({
                      fieldId: field.id,
                      label: field.label,
                      value: answers[field.id] ?? ""
                    }))
                    .filter((field) => field.value.trim())
                });

                if (initialized.data.mode === "live") {
                  window.location.href = initialized.data.checkoutUrl;
                  return;
                }

                await verifyCheckout.mutateAsync({ reference: initialized.data.reference });
                router.push(currentUser ? "/dashboard/tickets" : `/events/${event.slug}`);
              } catch (error) {
                setCheckoutError(getRequestErrorMessage(error, "We couldn't start this checkout yet."));
              }
            }}
          >
            {checkoutError ? (
              <div className="flex items-start gap-3 rounded-[16px] border border-[#f0ccd2] bg-[#fff6f7] px-4 py-3 text-sm text-[#923647]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{checkoutError}</p>
              </div>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Ticket type</span>
                <Select value={selectedTier.id} onChange={(event) => setTicketTypeId(event.target.value)}>
                  {ticketTiers.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} - {tier.price === 0 ? "Free" : formatCurrency(tier.price)}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Quantity</span>
                <Input
                  type="number"
                  min={1}
                  max={selectedTier.quantity}
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(1, Math.min(selectedTier.quantity, Number(event.target.value))))}
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">First name</span>
                <Input value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Last name</span>
                <Input value={lastName} onChange={(event) => setLastName(event.target.value)} required />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Email address</span>
                <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Phone number</span>
                <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
              </label>
            </div>

            {event.customFields.length ? (
              <div className="rounded-[18px] border border-line bg-surface-subtle p-5">
                <h2 className="text-lg font-semibold text-ink">Extra details for the organizer</h2>
                <div className="mt-4 space-y-4">
                  {event.customFields.map((field) => (
                    <label key={field.id} className="block space-y-2">
                      <span className="text-sm font-semibold text-ink">
                        {field.label}
                        {field.required ? " *" : ""}
                      </span>
                      {field.type === "select" ? (
                        <Select
                          value={answers[field.id] ?? ""}
                          onChange={(event) => setAnswers((current) => ({ ...current, [field.id]: event.target.value }))}
                          required={field.required}
                        >
                          <option value="">Select an option</option>
                          {field.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Input
                          type={field.type === "number" ? "number" : "text"}
                          value={answers[field.id] ?? ""}
                          placeholder={field.placeholder}
                          onChange={(event) => setAnswers((current) => ({ ...current, [field.id]: event.target.value }))}
                          required={field.required}
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink">Extra comment</span>
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Optional note for the organizer"
                className="min-h-[120px]"
              />
            </label>

            <Button type="submit" variant="pill" size="lg" disabled={initializeCheckout.isPending || verifyCheckout.isPending}>
              {initializeCheckout.isPending || verifyCheckout.isPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <LockKeyhole className="h-4 w-4" />
              )}
              Pay now
            </Button>
          </form>
        </section>

        <aside className="space-y-5">
          <section className="surface-panel overflow-hidden">
            <div className="dashboard-wave-card px-5 py-6 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">Order summary</p>
              <h2 className="font-display mt-4 text-[1.8rem] font-semibold tracking-[-0.04em]">{event.title}</h2>
              <p className="mt-2 text-sm text-white/80">{selectedTier.name}</p>
            </div>
            <div className="space-y-4 p-5">
              <div className="rounded-[16px] bg-surface-subtle p-4">
                <div className="flex items-start justify-between gap-4 text-sm text-muted">
                  <span>Ticket subtotal</span>
                  <span>{pricing?.ticketSubtotal === 0 ? "Free" : formatCurrency(pricing?.ticketSubtotal ?? 0)}</span>
                </div>
                <div className="mt-3 flex items-start justify-between gap-4 text-sm text-muted">
                  <span>Service fee</span>
                  <span>{pricing?.serviceFee === 0 ? "Free" : formatCurrency(pricing?.serviceFee ?? 0)}</span>
                </div>
                <div className="mt-3 flex items-start justify-between gap-4 text-sm text-muted">
                  <span>Organizer receives</span>
                  <span>{pricing?.organizerNetAmount === 0 ? "Free" : formatCurrency(pricing?.organizerNetAmount ?? 0)}</span>
                </div>
                <div className="mt-3 flex items-start justify-between gap-4 border-t border-line pt-3 text-sm font-semibold text-ink">
                  <span>Total</span>
                  <span>{pricing?.buyerTotal === 0 ? "Free" : formatCurrency(pricing?.buyerTotal ?? 0)}</span>
                </div>
              </div>
              <div className="space-y-3 text-sm text-muted">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-accent" />
                  <span>{quantity} ticket{quantity === 1 ? "" : "s"} selected</span>
                </div>
                <p>
                  Secure payment is handled by Paystack after you confirm this order. We keep the ticket answers here so organizers receive the right attendee context.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
