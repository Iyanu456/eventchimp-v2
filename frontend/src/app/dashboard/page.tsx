"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Ticket,
  Users
} from "lucide-react";
import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { useOrganizerDashboardQuery } from "@/hooks/queries/use-organizer-dashboard-query";
import { cn, formatCurrency, formatEventDate } from "@/lib/utils";
import { Event, Transaction } from "@/types/domain";

const getStatusTone = (status: Event["status"]) => {
  if (status === "published") return "success";
  if (status === "cancelled") return "danger";
  if (status === "sold_out") return "warning";
  return "default";
};

const getTransactionTone = (status: Transaction["status"]) => {
  if (status === "success") return "success";
  if (status === "failed") return "danger";
  if (status === "refunded") return "warning";
  return "default";
};

function RevenueChart({ transactions }: { transactions: Transaction[] }) {
  const buckets = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      revenue: 0
    };
  });

  transactions.forEach((transaction) => {
    const key = new Date(transaction.createdAt).toISOString().slice(0, 10);
    const bucket = buckets.find((item) => item.key === key);
    if (bucket) {
      bucket.revenue += transaction.organizerNetAmount ?? transaction.organizerShare;
    }
  });

  const max = Math.max(...buckets.map((bucket) => bucket.revenue), 1);
  const points = buckets
    .map((bucket, index) => {
      const x = 40 + index * (520 / Math.max(buckets.length - 1, 1));
      const y = 190 - (bucket.revenue / max) * 130;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <section className="surface-panel p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Revenue pulse</p>
          <p className="mt-2 text-sm leading-7 text-muted">Organizer revenue from verified ticket orders in the last 7 days.</p>
        </div>
        <Badge tone="accent">Protected revenue</Badge>
      </div>

      <div className="mt-5 rounded-[18px] bg-[#fcfbfe] p-4">
        <svg viewBox="0 0 600 230" className="h-[230px] w-full">
          {[0, 1, 2, 3].map((line) => (
            <path key={line} d={`M40 ${58 + line * 42}H560`} stroke="#ECE8F3" strokeWidth="1.5" />
          ))}
          <polyline points={points} fill="none" stroke="#8E2BDE" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {buckets.map((bucket, index) => {
            const x = 40 + index * (520 / Math.max(buckets.length - 1, 1));
            const y = 190 - (bucket.revenue / max) * 130;
            return <circle key={bucket.key} cx={x} cy={y} r="5" fill="#8E2BDE" stroke="#fff" strokeWidth="3" />;
          })}
        </svg>
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted">
          {buckets.map((bucket) => (
            <span key={bucket.key}>{bucket.label}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SetupCard({
  payoutReady,
  pendingSettlements,
  mismatchCount
}: {
  payoutReady: boolean;
  pendingSettlements: number;
  mismatchCount: number;
}) {
  return (
    <section className="surface-panel p-5 md:p-6">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
            payoutReady ? "bg-success/12 text-success" : "bg-[#fff2df] text-[#ca8a2b]"
          )}
        >
          {payoutReady ? <BadgeCheck className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
        </span>
        <div>
          <p className="text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">
            {payoutReady ? "Payouts are ready" : "Finish payout setup"}
          </p>
          <p className="mt-2 text-sm leading-7 text-muted">
            {payoutReady
              ? "Paid ticket revenue can settle to your verified account."
              : "You need a verified payout profile before EventChimp will let you create or publish events."}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm">
        <div className="flex items-center justify-between rounded-[14px] bg-surface-subtle px-4 py-3">
          <span className="text-muted">Processing settlements</span>
          <span className="font-semibold text-ink">{pendingSettlements}</span>
        </div>
        <div className="flex items-center justify-between rounded-[14px] bg-surface-subtle px-4 py-3">
          <span className="text-muted">Needs review</span>
          <span className="font-semibold text-ink">{mismatchCount}</span>
        </div>
      </div>

      <Link href={payoutReady ? "/dashboard/payouts" : "/dashboard/settings"}>
        <Button variant="pill" className="mt-5 w-full">
          {payoutReady ? "View payouts" : "Open Account"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </section>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useOrganizerDashboardQuery();

  const publishedEvents = data?.events.filter((event) => event.status === "published").length ?? 0;
  const draftEvents = data?.events.filter((event) => event.status === "draft").length ?? 0;
  const upcomingEvents =
    data?.events
      .filter((event) => new Date(event.startDate) >= new Date())
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 3) ?? [];
  const recentTransactions = data?.transactions.slice(0, 5) ?? [];
  const recentGuests = data?.guestList.slice(0, 4) ?? [];
  const payoutReady = Boolean(data?.payout?.payoutReady);

  return (
    <RoleGuard roles={["organizer", "admin"]}>
      <DashboardShell title="Overview" subtitle="Track events, sales, attendees, and payout readiness from one workspace.">
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="surface-panel h-32 animate-pulse" />
            ))}
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total events" value={String(data.metrics.eventsCount)} note={`${publishedEvents} published, ${draftEvents} drafts`} />
              <StatCard label="Tickets issued" value={String(data.metrics.attendeesCount)} note="Verified tickets across your events" />
              <StatCard label="Organizer revenue" value={formatCurrency(data.metrics.revenue)} note="Ticket revenue protected from fees" />
              <StatCard label="Buyer-paid fees" value={formatCurrency(data.metrics.buyerPaidServiceFees)} note="Service fees paid on top of tickets" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_340px]">
              <RevenueChart transactions={data.transactions} />
              <SetupCard
                payoutReady={payoutReady}
                pendingSettlements={data.settlement.pendingCount}
                mismatchCount={data.settlement.mismatchCount}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
              <section className="surface-panel overflow-hidden">
                <div className="flex items-center justify-between border-b border-line/80 px-5 py-5 md:px-6">
                  <div>
                    <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Upcoming events</p>
                    <p className="mt-1 text-sm text-muted">The next events on your calendar.</p>
                  </div>
                  <Link href="/dashboard/events">
                    <Button variant="secondary" className="rounded-full">Manage</Button>
                  </Link>
                </div>
                {upcomingEvents.length ? (
                  <div className="divide-y divide-line/70">
                    {upcomingEvents.map((event) => (
                      <div key={event._id} className="grid gap-4 px-5 py-5 md:grid-cols-[88px_minmax(0,1fr)_auto] md:items-center md:px-6">
                        <div
                          className="h-20 rounded-[14px] bg-cover bg-center"
                          style={{
                            backgroundImage: `linear-gradient(180deg, rgba(22,16,30,0.05), rgba(22,16,30,0.35)), url(${event.coverImage})`
                          }}
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-2">
                            <Badge tone={getStatusTone(event.status)}>{event.status.replace("_", " ")}</Badge>
                            <Badge tone="accent">{event.isFree ? "Free" : formatCurrency(event.ticketPrice)}</Badge>
                          </div>
                          <p className="mt-3 truncate text-base font-semibold text-ink">{event.title}</p>
                          <p className="mt-1 text-sm text-muted">{formatEventDate(event.startDate)}</p>
                        </div>
                        <Link href={`/dashboard/events/${event._id}`} className="text-sm font-semibold text-accent">
                          Open
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 md:p-6">
                    <EmptyState
                      title="No upcoming events"
                      description="Create an event and it will appear here once it has a future start date."
                      action={
                        <Link href="/dashboard/events/new">
                          <Button variant="pill">Create event</Button>
                        </Link>
                      }
                    />
                  </div>
                )}
              </section>

              <section className="surface-panel overflow-hidden">
                <div className="flex items-center justify-between border-b border-line/80 px-5 py-5 md:px-6">
                  <div>
                    <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Recent orders</p>
                    <p className="mt-1 text-sm text-muted">Latest verified checkout activity.</p>
                  </div>
                  <CreditCard className="h-5 w-5 text-accent" />
                </div>
                {recentTransactions.length ? (
                  <div className="divide-y divide-line/70">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction._id} className="grid gap-2 px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:px-6">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">{transaction.eventId?.title ?? "Event ticket"}</p>
                          <p className="mt-1 text-xs text-muted">{transaction.providerReference}</p>
                        </div>
                        <div className="flex items-center justify-between gap-4 md:justify-end">
                          <Badge tone={getTransactionTone(transaction.status)}>{transaction.status}</Badge>
                          <span className="text-sm font-semibold text-ink">{formatCurrency(transaction.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 md:p-6">
                    <EmptyState title="No orders yet" description="Orders appear here after guests complete checkout." />
                  </div>
                )}
              </section>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <section className="surface-panel p-5 md:p-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Recent attendees</p>
                </div>
                <div className="mt-5 space-y-3">
                  {recentGuests.length ? (
                    recentGuests.map((ticket) => (
                      <div key={ticket._id} className="flex items-center justify-between gap-4 rounded-[14px] bg-surface-subtle px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">
                            {[ticket.attendeeFirstName, ticket.attendeeLastName].filter(Boolean).join(" ") || ticket.attendeeEmail || "Guest"}
                          </p>
                          <p className="truncate text-xs text-muted">{ticket.eventId?.title ?? ticket.ticketTypeName ?? "Ticket"}</p>
                        </div>
                        <Badge tone={ticket.checkedIn ? "success" : "default"}>{ticket.checkedIn ? "Checked in" : "Issued"}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-[14px] bg-surface-subtle px-4 py-5 text-sm leading-7 text-muted">
                      Attendee activity will show up here after tickets are issued.
                    </p>
                  )}
                </div>
              </section>

              <section className="dashboard-wave-card rounded-[22px] p-6 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">Next best actions</p>
                <h2 className="font-display mt-4 max-w-xl text-[2rem] font-semibold tracking-[-0.05em]">
                  Keep your events ready for launch.
                </h2>
                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  {[
                    { href: "/dashboard/events/new", icon: CalendarDays, label: "Create event" },
                    { href: "/dashboard/tickets", icon: Ticket, label: "View tickets" },
                    { href: payoutReady ? "/dashboard/payouts" : "/dashboard/settings", icon: CircleDollarSign, label: payoutReady ? "Review payouts" : "Setup payout" }
                  ].map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="rounded-[16px] border border-white/15 bg-white/10 p-4 transition hover:bg-white/15"
                    >
                      <action.icon className="h-5 w-5" />
                      <span className="mt-4 block text-sm font-semibold">{action.label}</span>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <EmptyState title="No dashboard data" description="Sign in with an organizer account to load live metrics." />
        )}
      </DashboardShell>
    </RoleGuard>
  );
}
