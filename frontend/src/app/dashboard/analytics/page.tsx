"use client";

import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  MousePointer2,
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

type TrendBucket = {
  key: string;
  label: string;
  revenue: number;
  orders: number;
};

const eventStatusTone = (status: Event["status"]) => {
  if (status === "published") return "success";
  if (status === "sold_out") return "warning";
  if (status === "cancelled") return "danger";
  return "default";
};

const buildTrendBuckets = (transactions: Transaction[]) => {
  const buckets = Array.from({ length: 14 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - index));
    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      revenue: 0,
      orders: 0
    };
  });

  transactions.forEach((transaction) => {
    const key = new Date(transaction.createdAt).toISOString().slice(0, 10);
    const bucket = buckets.find((item) => item.key === key);
    if (!bucket) return;

    bucket.revenue += transaction.organizerNetAmount ?? transaction.organizerShare;
    bucket.orders += 1;
  });

  return buckets;
};

function TrendChart({ buckets }: { buckets: TrendBucket[] }) {
  const maxRevenue = Math.max(...buckets.map((bucket) => bucket.revenue), 1);
  const maxOrders = Math.max(...buckets.map((bucket) => bucket.orders), 1);
  const revenuePoints = buckets
    .map((bucket, index) => {
      const x = 42 + index * (680 / Math.max(buckets.length - 1, 1));
      const y = 220 - (bucket.revenue / maxRevenue) * 150;
      return `${x},${y}`;
    })
    .join(" ");
  const orderPoints = buckets
    .map((bucket, index) => {
      const x = 42 + index * (680 / Math.max(buckets.length - 1, 1));
      const y = 220 - (bucket.orders / maxOrders) * 120;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <section className="surface-panel p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Sales momentum</p>
          <p className="mt-2 text-sm leading-7 text-muted">Revenue and completed order movement over the last 14 days.</p>
        </div>
        <div className="flex gap-2">
          <Badge tone="accent">Revenue</Badge>
          <Badge tone="default">Orders</Badge>
        </div>
      </div>

      <div className="mt-5 rounded-[18px] bg-[#fcfbfe] p-4">
        <svg viewBox="0 0 760 270" className="h-[270px] w-full">
          {[0, 1, 2, 3].map((line) => (
            <path key={line} d={`M42 ${64 + line * 43}H722`} stroke="#ECE8F3" strokeWidth="1.5" />
          ))}
          <polyline points={orderPoints} fill="none" stroke="#F0A64F" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={revenuePoints} fill="none" stroke="#8E2BDE" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          {buckets.map((bucket, index) => {
            const x = 42 + index * (680 / Math.max(buckets.length - 1, 1));
            const y = 220 - (bucket.revenue / maxRevenue) * 150;
            return <circle key={bucket.key} cx={x} cy={y} r="4.8" fill="#8E2BDE" stroke="#fff" strokeWidth="3" />;
          })}
        </svg>
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted md:grid-cols-14">
          {buckets.map((bucket, index) => (
            <span key={bucket.key} className={cn(index % 2 === 1 && "hidden md:block")}>
              {bucket.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function DistributionCard({
  title,
  description,
  rows
}: {
  title: string;
  description: string;
  rows: Array<{ label: string; value: number; tone?: "accent" | "success" | "warning" | "danger" | "default" }>;
}) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <section className="surface-panel p-5 md:p-6">
      <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">{title}</p>
      <p className="mt-2 text-sm leading-7 text-muted">{description}</p>
      <div className="mt-5 space-y-4">
        {rows.map((row) => {
          const width = total ? Math.max((row.value / total) * 100, row.value ? 8 : 0) : 0;
          return (
            <div key={row.label}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="font-semibold text-ink">{row.label}</span>
                <span className="text-muted">{row.value}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#f0eef4]">
                <div
                  className={cn(
                    "h-full rounded-full",
                    row.tone === "success" && "bg-success",
                    row.tone === "warning" && "bg-warning",
                    row.tone === "danger" && "bg-danger",
                    row.tone === "default" && "bg-[#a9a2b7]",
                    (!row.tone || row.tone === "accent") && "bg-accent"
                  )}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function AnalyticsPage() {
  const { data, isLoading } = useOrganizerDashboardQuery();

  const events = data?.events ?? [];
  const transactions = data?.transactions ?? [];
  const guests = data?.guestList ?? [];
  const trendBuckets = buildTrendBuckets(transactions);
  const totalCapacity = events.reduce((sum, event) => sum + event.capacity, 0);
  const totalAttendees = events.reduce((sum, event) => sum + event.attendeesCount, 0);
  const capacityUsed = totalCapacity ? Math.round((totalAttendees / totalCapacity) * 100) : 0;
  const averageOrderValue = transactions.length
    ? data!.metrics.revenue / transactions.length
    : 0;
  const highestPrice = Math.max(...events.map((event) => event.ticketPrice), 0);
  const eventRevenue = events
    .map((event) => {
      const revenue = transactions
        .filter((transaction) => transaction.eventId?._id === event._id)
        .reduce((sum, transaction) => sum + (transaction.organizerNetAmount ?? transaction.organizerShare), 0);

      return {
        event,
        revenue
      };
    })
    .sort((a, b) => b.revenue - a.revenue || b.event.attendeesCount - a.event.attendeesCount);
  const statusRows = [
    { label: "Published", value: events.filter((event) => event.status === "published").length, tone: "success" as const },
    { label: "Draft", value: events.filter((event) => event.status === "draft").length, tone: "default" as const },
    { label: "Sold out", value: events.filter((event) => event.status === "sold_out").length, tone: "warning" as const },
    { label: "Cancelled", value: events.filter((event) => event.status === "cancelled").length, tone: "danger" as const }
  ];
  const accessRows = [
    { label: "In person", value: events.filter((event) => (event.attendanceMode ?? "in_person") === "in_person").length, tone: "accent" as const },
    { label: "Virtual", value: events.filter((event) => event.attendanceMode === "virtual").length, tone: "success" as const },
    { label: "Hybrid", value: events.filter((event) => event.attendanceMode === "hybrid").length, tone: "warning" as const }
  ];

  return (
    <RoleGuard roles={["organizer", "admin"]}>
      <DashboardShell title="Analytics" subtitle="Understand sales, event performance, capacity, and attendee activity.">
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="surface-panel h-32 animate-pulse" />
            ))}
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Organizer revenue" value={formatCurrency(data.metrics.revenue)} note="Net ticket revenue protected from fees" />
              <StatCard label="Orders completed" value={String(transactions.length)} note={`${formatCurrency(averageOrderValue)} average order value`} />
              <StatCard label="Capacity filled" value={`${capacityUsed}%`} note={`${totalAttendees} of ${totalCapacity || 0} seats claimed`} />
              <StatCard label="Top ticket price" value={formatCurrency(highestPrice)} note="Highest listed ticket tier baseline" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_340px]">
              <TrendChart buckets={trendBuckets} />
              <section className="dashboard-wave-card rounded-[22px] p-6 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">Analytics snapshot</p>
                <h2 className="font-display mt-4 text-[2rem] font-semibold tracking-[-0.05em]">
                  {events.length ? `${events.length} event${events.length === 1 ? "" : "s"} in motion` : "No events yet"}
                </h2>
                <div className="mt-6 grid gap-3">
                  <div className="rounded-[16px] border border-white/15 bg-white/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Ticket className="h-4 w-4" />
                      Tickets issued
                    </div>
                    <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{data.metrics.attendeesCount}</p>
                  </div>
                  <div className="rounded-[16px] border border-white/15 bg-white/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <CircleDollarSign className="h-4 w-4" />
                      Buyer-paid fees
                    </div>
                    <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{formatCurrency(data.metrics.buyerPaidServiceFees)}</p>
                  </div>
                  <Link
                    href="/dashboard/events/new"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#41215f] transition hover:bg-white/90"
                  >
                    Create event
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </section>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <DistributionCard title="Status mix" description="How your event pipeline is distributed right now." rows={statusRows} />
              <DistributionCard title="Access mix" description="Where your audience is expected to attend from." rows={accessRows} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
              <section className="surface-panel overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line/80 px-5 py-5 md:px-6">
                  <div>
                    <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Event performance</p>
                    <p className="mt-1 text-sm text-muted">Capacity, status, and revenue by event.</p>
                  </div>
                  <BarChart3 className="h-5 w-5 text-accent" />
                </div>
                {eventRevenue.length ? (
                  <div className="divide-y divide-line/70">
                    {eventRevenue.slice(0, 6).map(({ event, revenue }) => {
                      const capacityPercent = event.capacity ? Math.min((event.attendeesCount / event.capacity) * 100, 100) : 0;
                      return (
                        <div key={event._id} className="grid gap-4 px-5 py-5 md:grid-cols-[minmax(0,1fr)_150px] md:items-center md:px-6">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge tone={eventStatusTone(event.status)}>{event.status.replace("_", " ")}</Badge>
                              <Badge tone="accent">{event.category}</Badge>
                            </div>
                            <p className="mt-3 truncate text-base font-semibold text-ink">{event.title}</p>
                            <p className="mt-1 text-sm text-muted">{formatEventDate(event.startDate)}</p>
                            <div className="mt-4">
                              <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted">
                                <span>{event.attendeesCount} guests</span>
                                <span>{event.capacity} capacity</span>
                              </div>
                              <div className="h-2.5 overflow-hidden rounded-full bg-[#f0eef4]">
                                <div className="h-full rounded-full bg-accent" style={{ width: `${capacityPercent}%` }} />
                              </div>
                            </div>
                          </div>
                          <div className="rounded-[16px] bg-surface-subtle px-4 py-4 text-left md:text-right">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Revenue</p>
                            <p className="mt-2 text-lg font-semibold text-ink">{formatCurrency(revenue)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-5 md:p-6">
                    <EmptyState title="No event performance yet" description="Create an event and sales or attendance metrics will appear here." />
                  </div>
                )}
              </section>

              <section className="surface-panel p-5 md:p-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Attendee signals</p>
                </div>
                <div className="mt-5 grid gap-4">
                  <div className="rounded-[16px] bg-surface-subtle p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted">Checked in</span>
                      <span className="font-semibold text-ink">{guests.filter((ticket) => ticket.checkedIn).length}</span>
                    </div>
                  </div>
                  <div className="rounded-[16px] bg-surface-subtle p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted">Issued tickets</span>
                      <span className="font-semibold text-ink">{guests.length}</span>
                    </div>
                  </div>
                  <div className="rounded-[16px] bg-surface-subtle p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted">Paid orders</span>
                      <span className="font-semibold text-ink">{transactions.filter((transaction) => transaction.amount > 0).length}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[18px] border border-line bg-white p-4 shadow-soft">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    {data.payout?.payoutReady ? (
                      <BadgeCheck className="h-4 w-4 text-success" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-[#ca8a2b]" />
                    )}
                    Payout readiness
                  </div>
                  <p className="mt-2 text-sm leading-7 text-muted">
                    {data.payout?.payoutReady
                      ? "Your paid event analytics are settlement-ready."
                      : "Paid event analytics can accumulate, but publishing paid events requires account setup."}
                  </p>
                  <Link href={data.payout?.payoutReady ? "/dashboard/payouts" : "/dashboard/settings"}>
                    <Button variant="secondary" className="mt-4 rounded-full">
                      {data.payout?.payoutReady ? "View payouts" : "Setup account"}
                    </Button>
                  </Link>
                </div>
              </section>
            </div>

            <section className="surface-panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-line/80 px-5 py-5 md:px-6">
                <div>
                  <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Recent buyer activity</p>
                  <p className="mt-1 text-sm text-muted">Latest orders feeding your analytics.</p>
                </div>
                <Activity className="h-5 w-5 text-accent" />
              </div>
              {transactions.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="table-header">
                      <tr>
                        <th className="px-5 py-4">Buyer</th>
                        <th className="px-5 py-4">Event</th>
                        <th className="px-5 py-4">Ticket</th>
                        <th className="px-5 py-4">Qty</th>
                        <th className="px-5 py-4 text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 6).map((transaction) => (
                        <tr key={transaction._id} className="table-row">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-ink">
                              {[transaction.attendeeFirstName, transaction.attendeeLastName].filter(Boolean).join(" ") || "Guest"}
                            </p>
                            <p className="text-xs text-muted">{transaction.attendeeEmail ?? transaction.providerReference}</p>
                          </td>
                          <td className="px-5 py-4 text-muted">{transaction.eventId?.title ?? "Event ticket"}</td>
                          <td className="px-5 py-4 text-muted">{transaction.ticketTypeName ?? "Ticket"}</td>
                          <td className="px-5 py-4 text-muted">{transaction.quantity}</td>
                          <td className="px-5 py-4 text-right font-semibold text-ink">
                            {formatCurrency(transaction.organizerNetAmount ?? transaction.organizerShare)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-5 md:p-6">
                  <EmptyState title="No buyer activity yet" description="Completed checkout activity will appear here once guests start buying tickets." />
                </div>
              )}
            </section>

            {!events.length ? (
              <section className="dashboard-wave-card rounded-[22px] p-6 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">Get started</p>
                <h2 className="font-display mt-4 max-w-xl text-[2rem] font-semibold tracking-[-0.05em]">
                  Analytics become useful after your first event is live.
                </h2>
                <Link href="/dashboard/events/new">
                  <Button variant="secondary" className="mt-6 rounded-full bg-white text-[#41215f] hover:bg-white/90">
                    Create event
                    <MousePointer2 className="h-4 w-4" />
                  </Button>
                </Link>
              </section>
            ) : null}
          </div>
        ) : (
          <EmptyState title="No analytics yet" description="Create an event to start collecting analytics." />
        )}
      </DashboardShell>
    </RoleGuard>
  );
}
