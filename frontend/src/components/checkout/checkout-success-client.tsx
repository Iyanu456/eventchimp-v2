"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Download, FileText, ImageDown, LoaderCircle, TicketCheck } from "lucide-react";
import { request } from "@/apiServices/requests";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { downloadTicketPdf, downloadTicketPng } from "@/components/checkout/ticket-downloads";
import { formatCurrency, formatEventDate, getRequestErrorMessage } from "@/lib/utils";
import type { Ticket, Transaction } from "@/types/domain";

type CheckoutSuccessClientProps = {
  reference: string;
  eventSlug?: string;
  initialResult?: {
    transaction: Transaction;
    tickets: Ticket[];
  } | null;
  initialError?: string | null;
};

export function CheckoutSuccessClient({ reference, eventSlug, initialResult = null, initialError = null }: CheckoutSuccessClientProps) {
  const [tickets, setTickets] = useState<Ticket[]>(initialResult?.tickets ?? []);
  const [transaction, setTransaction] = useState<Transaction | null>(initialResult?.transaction ?? null);
  const [isLoading, setIsLoading] = useState(!initialResult && !initialError);
  const [error, setError] = useState<string | null>(initialError);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (initialResult || initialError) {
      return;
    }

    let isMounted = true;

    const verifyOrder = async () => {
      if (!reference) {
        setError("We could not find the checkout reference for this purchase.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await request.verifyCheckout({ reference });
        if (!isMounted) {
          return;
        }
        setTickets(response.data.tickets);
        setTransaction(response.data.transaction);
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }
        setError(getRequestErrorMessage(caughtError, "We could not confirm this ticket purchase yet."));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifyOrder();

    return () => {
      isMounted = false;
    };
  }, [initialError, initialResult, reference]);

  const event = tickets[0]?.eventId;
  const isFreeOrder = (transaction?.buyerTotal ?? tickets[0]?.totalPaid ?? 0) === 0;
  const eventHref = eventSlug || event?.slug ? `/events/${eventSlug ?? event?.slug}` : "/events";

  const orderSummary = useMemo(() => {
    const ticketCount = tickets.length || transaction?.quantity || 0;
    return {
      ticketCount,
      total: transaction?.buyerTotal ?? tickets.reduce((sum, ticket) => sum + ticket.totalPaid, 0),
      serviceFee: transaction?.serviceFee ?? tickets.reduce((sum, ticket) => sum + ticket.serviceFee, 0)
    };
  }, [tickets, transaction]);

  const handleDownload = async (type: "png" | "pdf", ticket: Ticket) => {
    const key = `${type}:${ticket._id}`;
    setDownloading(key);
    try {
      if (type === "png") {
        await downloadTicketPng(ticket, ticket.eventId);
      } else {
        await downloadTicketPdf(ticket, ticket.eventId);
      }
    } finally {
      setDownloading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="page-shell flex min-h-[70vh] items-center justify-center py-16">
        <div className="surface-panel max-w-lg p-8 text-center">
          <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-accent" />
          <h1 className="font-display mt-5 text-2xl font-semibold tracking-[-0.04em] text-ink">Confirming your tickets</h1>
          <p className="mt-3 text-sm leading-7 text-muted">We are checking your order and preparing your ticket files.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell flex min-h-[70vh] items-center justify-center py-16">
        <div className="surface-panel max-w-xl p-8">
          <div className="flex items-start gap-4 rounded-[18px] border border-[#f0ccd2] bg-[#fff6f7] p-4 text-[#923647]">
            <AlertCircle className="mt-1 h-5 w-5 shrink-0" />
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-[-0.04em] text-ink">Ticket confirmation needs another try</h1>
              <p className="mt-2 text-sm leading-7">{error}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="pill" onClick={() => window.location.reload()}>
              Try again
            </Button>
            <Button variant="secondary" onClick={() => history.back()}>
              Back to checkout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-10">
      <section className="surface-panel overflow-hidden">
        <div className="dashboard-wave-card px-6 py-10 text-white md:px-10">
          <Badge tone="default" className="bg-white/15 text-white ring-1 ring-white/20">
            {isFreeOrder ? "Free ticket secured" : "Payment successful"}
          </Badge>
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-accent">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h1 className="font-display mt-5 text-[2.4rem] font-semibold leading-[1.05] tracking-[-0.06em] md:text-[3.2rem] max-md:text-3xl">
                Your {orderSummary.ticketCount === 1 ? "ticket is" : "tickets are"} ready.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/78">
                {isFreeOrder
                  ? "We have issued your ticket and sent the confirmation to your email."
                  : "Your payment has been confirmed. We have issued your ticket and sent the confirmation to your email."}
              </p>
            </div>
            {/*<div className="max-md:hidden block rounded-[24px] bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Order reference</p>
              <p className="mt-2 break-all text-lg font-semibold">{reference}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-[16px] bg-white/10 p-3">
                  <p className="text-white/58">Tickets</p>
                  <p className="mt-1 text-xl font-semibold">{orderSummary.ticketCount}</p>
                </div>
                <div className="rounded-[16px] bg-white/10 p-3">
                  <p className="text-white/58">Total</p>
                  <p className="mt-1 text-xl font-semibold">{orderSummary.total ? formatCurrency(orderSummary.total) : "Free"}</p>
                </div>
              </div>
            </div>*/}
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-4">
          {tickets.map((ticket) => (
            <article key={ticket._id} className="surface-panel overflow-hidden">
              <div className="grid gap-6 p-5  md:grid-cols-[180px_minmax(0,1fr)]  md:p-6">
                <div className="max-md:hidden block rounded-[22px] border border-line bg-white p-4">
                  {ticket.qrCode ? (
                    <img src={ticket.qrCode} alt={`QR code for ${ticket.ticketCode ?? "ticket"}`} className="aspect-square w-full rounded-[14px] object-contain" />
                  ) : (
                    <div className="flex aspect-square items-center justify-center rounded-[14px] bg-surface-subtle text-muted">
                      <TicketCheck className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Ticket code</p>
                      <h2 className="mt-2 break-all max-md:text-lg text-2xl font-semibold tracking-[-0.04em] text-ink">
                        {ticket.ticketCode ?? ticket.orderReference ?? ticket.paymentReference}
                      </h2>
                    </div>
                    <Badge tone="success">{ticket.status === "checked_in" ? "Checked in" : "Issued"}</Badge>
                  </div>
                  <div className="mt-5 grid gap-4 text-sm text-muted md:grid-cols-2">
                    <div>
                      <p className="font-semibold text-ink">Attendee</p>
                      <p className="mt-1">{`${ticket.attendeeFirstName ?? ""} ${ticket.attendeeLastName ?? ""}`.trim() || "Guest"}</p>
                      <p>{ticket.attendeeEmail}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">Ticket</p>
                      <p className="mt-1">{ticket.ticketTypeName ?? "General admission"}</p>
                      <p>{ticket.totalPaid ? formatCurrency(ticket.totalPaid) : "Free"}</p>
                    </div>
                    {ticket.eventId ? (
                      <div className="md:col-span-2">
                        <p className="font-semibold text-ink">Event</p>
                        <p className="mt-1">{ticket.eventId.title}</p>
                        <p>{ticket.eventId.startDate ? formatEventDate(ticket.eventId.startDate) : "Date to be announced"}</p>
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button variant="secondary" className="max-md:w-full" onClick={() => handleDownload("png", ticket)} disabled={downloading !== null}>
                      {downloading === `png:${ticket._id}` ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImageDown className="h-4 w-4" />}
                      Download PNG
                    </Button>
                    <Button variant="secondary" className="max-md:w-full" onClick={() => handleDownload("pdf", ticket)} disabled={downloading !== null}>
                      {downloading === `pdf:${ticket._id}` ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="space-y-5">
          <section className="surface-panel p-5">
            <h2 className="text-lg font-semibold text-ink">What happens next?</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-muted">
              <p>Keep the QR code handy. The organizer will scan one QR code per guest at check-in.</p>
              <p>The ticket confirmation has also been sent to the email address used at checkout.</p>
            </div>
            <div className="mt-6 grid gap-3">
              <Link href={eventHref}>
                <Button variant="pill" className="w-full">
                  View event
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="secondary" className="w-full">
                  Explore more events
                </Button>
              </Link>
            </div>
          </section>

          <section className="surface-panel p-5">
            <p className="text-sm font-semibold text-ink">Receipt summary</p>
            <div className="mt-4 space-y-3 text-sm text-muted">
              <div className="flex justify-between gap-4">
                <span>Ticket total</span>
                <span>{orderSummary.total ? formatCurrency(orderSummary.total - orderSummary.serviceFee) : "Free"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Service fee</span>
                <span>{orderSummary.serviceFee ? formatCurrency(orderSummary.serviceFee) : "Free"}</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-line pt-3 font-semibold text-ink">
                <span>Total paid</span>
                <span>{orderSummary.total ? formatCurrency(orderSummary.total) : "Free"}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
