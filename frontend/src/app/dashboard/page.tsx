"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useOrganizerDashboardQuery } from "@/hooks/queries/use-organizer-dashboard-query";
import { cn, formatCurrency } from "@/lib/utils";

function MetricCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="surface-panel p-5">
      <p className="text-[15px] font-medium text-muted">{label}</p>
      <p className="font-display mt-4 text-[2.45rem] font-semibold tracking-[-0.05em] text-ink">{value}</p>
      {note ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-muted">
          <span className="rounded-full bg-[#dff7ef] px-2 py-0.5 text-[11px] font-semibold text-success">11.68%</span>
          <span>{note}</span>
        </div>
      ) : null}
    </div>
  );
}

function ChartCard({ values }: { values: number[] }) {
  const income = values.length ? values : [120, 340, 300, 620, 640, 710, 580, 730, 660, 760, 620, 740];
  const expense = income.map((value, index) => Math.max(value - 130 + (index % 3) * 42, 100));
  const max = Math.max(...income, ...expense, 1);
  const buildPoints = (points: number[]) =>
    points
      .map((value, index) => {
        const x = 40 + index * (640 / Math.max(points.length - 1, 1));
        const y = 220 - (value / max) * 150;
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <div className="surface-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[1.5rem] font-semibold tracking-[-0.03em] text-ink">Ticket Sales</h2>
          <p className="text-sm text-muted">Last 30 days</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full border border-[#2b213b] px-3 py-2 text-sm font-medium text-[#2b213b]">
          This year
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-5 rounded-[18px] bg-[#fcfbfe] p-4">
        <svg viewBox="0 0 760 260" className="h-[240px] w-full">
          {[0, 1, 2, 3].map((line) => (
            <path
              key={line}
              d={`M40 ${52 + line * 42}H720`}
              stroke="#ECE8F3"
              strokeWidth="1.5"
            />
          ))}
          <polyline points={buildPoints(expense)} fill="none" stroke="#F0A64F" strokeWidth="4" strokeLinecap="round" />
          <polyline points={buildPoints(income)} fill="none" stroke="#8E2BDE" strokeWidth="4" strokeLinecap="round" />
          {income.map((value, index) => {
            const x = 40 + index * (640 / Math.max(income.length - 1, 1));
            const y = 220 - (value / max) * 150;
            return <circle key={index} cx={x} cy={y} r="4.5" fill="#8E2BDE" />;
          })}
        </svg>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useOrganizerDashboardQuery();

  return (
    <RoleGuard roles={["organizer", "admin"]}>
      <DashboardShell showHeading={false}>
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="surface-panel h-32 animate-pulse" />
            ))}
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_160px_265px]">
              <MetricCard label="Tickets Sold" value={String(data.metrics.attendeesCount)} note="Compared to last month" />
              <MetricCard label="Revenue" value={formatCurrency(data.metrics.revenue)} note="Compared to last month" />
              <div className="surface-panel p-5">
                <p className="text-[15px] font-semibold text-ink">Keys</p>
                <div className="mt-4 space-y-3 text-sm text-muted">
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#33B28A]" /> Income</div>
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#F0A64F]" /> Expense</div>
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#F25555]" /> Projections</div>
                </div>
              </div>
              <div className="surface-panel p-5">
                <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Export data</p>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between rounded-[14px] border border-line px-4 py-3 text-sm font-medium text-ink">
                    <span>Export as PDF</span>
                    <ChevronDown className="h-4 w-4 text-muted" />
                  </div>
                  <div className="flex items-center justify-between rounded-[14px] border border-line px-4 py-3 text-sm font-medium text-ink">
                    <span>Last 1 month</span>
                    <ChevronDown className="h-4 w-4 text-muted" />
                  </div>
                  <Button variant="pill" className="w-full">Export now</Button>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_270px]">
              <div className="space-y-6">
                <ChartCard values={data.transactions.slice(0, 12).map((transaction) => transaction.amount)} />
                <div className="surface-panel overflow-hidden">
                  <div className="flex items-center justify-between border-b border-line/80 px-5 py-4">
                    <h2 className="text-[1.5rem] font-semibold tracking-[-0.03em] text-ink">Transactions</h2>
                    <button className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-sm font-medium text-ink">
                      Weekly
                      <ChevronDown className="h-4 w-4 text-muted" />
                    </button>
                  </div>
                  <div className="hidden grid-cols-[1.3fr_1fr_0.8fr_0.8fr] gap-3 bg-[#f7f5fa] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted md:grid">
                    <span>Name</span>
                    <span>Date</span>
                    <span>Status</span>
                    <span className="text-right">Amount</span>
                  </div>
                  <div>
                    {data.transactions.length ? (
                      data.transactions.slice(0, 4).map((transaction) => (
                        <div key={transaction._id} className="grid gap-3 border-t border-line/70 px-5 py-4 text-sm md:grid-cols-[1.3fr_1fr_0.8fr_0.8fr] md:items-center">
                          <div>
                            <p className="font-semibold text-ink">{transaction.organizerId?.name ?? "Shelby & Co."}</p>
                            <p className="text-xs text-muted">{transaction.eventId?.title ?? "Event ticket"}</p>
                          </div>
                          <div className="text-muted">
                            <p>{new Date(transaction.createdAt).toLocaleDateString()}</p>
                            <p className="text-xs">{new Date(transaction.createdAt).toLocaleTimeString()}</p>
                          </div>
                          <div>
                            <span
                              className={cn(
                                "rounded-full px-3 py-1 text-[11px] font-semibold",
                                transaction.status === "success" ? "bg-[#dff7ef] text-success" : "bg-[#fff2df] text-[#ca8a2b]"
                              )}
                            >
                              {transaction.status === "success" ? "Success" : "Pending"}
                            </span>
                          </div>
                          <div className="text-left font-semibold text-ink md:text-right">
                            {formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-5">
                        <EmptyState title="No transactions yet" description="Revenue activity will appear here once purchases are verified." />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="surface-panel p-5">
                <div className="rounded-[18px] bg-[#fbf8fe] p-4">
                  <Image
                    src="/dashboard-activity-illustration.svg"
                    alt="Dashboard activity illustration"
                    width={420}
                    height={300}
                    className="h-auto w-full"
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-[1.5rem] font-semibold tracking-[-0.03em] text-ink">Activity</p>
                  <p className="mt-2 text-sm text-muted">No activity to show yet</p>
                  <Button variant="pill" className="mt-5 min-w-[150px]">Continue</Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState title="No dashboard data" description="Sign in with an organizer account to load live metrics." />
        )}
      </DashboardShell>
    </RoleGuard>
  );
}
