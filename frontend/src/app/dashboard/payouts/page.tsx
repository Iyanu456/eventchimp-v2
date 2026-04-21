"use client";

import { BadgeCheck, Clock3, WalletCards } from "lucide-react";
import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { useOrganizerDashboardQuery } from "@/hooks/queries/use-organizer-dashboard-query";
import { usePayoutStatusQuery } from "@/hooks/queries/use-payout-status-query";
import { formatCurrency } from "@/lib/utils";

export default function PayoutsPage() {
  const { data, isLoading } = useOrganizerDashboardQuery();
  const { data: payoutStatus } = usePayoutStatusQuery();

  const transactions = data?.transactions ?? [];
  const organizerRevenue = transactions.reduce(
    (sum, item) => sum + (item.organizerNetAmount ?? item.organizerShare),
    0
  );
  const pendingPayouts = transactions.filter((item) => item.settlementStatus !== "reconciled");
  const processedPayouts = transactions.filter((item) => item.settlementStatus === "reconciled");

  return (
    <RoleGuard roles={["organizer", "admin"]}>
      <DashboardShell
        title="Payouts"
        subtitle="Track processed and currently processing payout settlements for your events."
      >
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Organizer revenue" value={formatCurrency(organizerRevenue)} />
            <StatCard label="Processing payouts" value={String(pendingPayouts.length)} />
            <StatCard label="Processed payouts" value={String(processedPayouts.length)} />
            <StatCard label="Payout readiness" value={payoutStatus?.payoutReady ? "Ready" : "Needs account setup"} />
          </div>

          <section className="surface-panel overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line/80 px-5 py-5 md:px-6">
              <div>
                <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Payout activity</p>
                <p className="mt-2 text-sm leading-7 text-muted">
                  Paid ticket revenue is tracked here as it moves through processing and settlement.
                </p>
              </div>
              {payoutStatus?.payoutReady ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#dff7ef] px-3 py-1 text-xs font-semibold text-success">
                  <BadgeCheck className="h-4 w-4" />
                  Account ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#fff2df] px-3 py-1 text-xs font-semibold text-[#ca8a2b]">
                  <Clock3 className="h-4 w-4" />
                  Setup needed in Account
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="h-[280px] animate-pulse bg-surface-subtle" />
            ) : transactions.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="table-header">
                    <tr>
                      <th className="px-5 py-4">Reference</th>
                      <th className="px-5 py-4">Event</th>
                      <th className="px-5 py-4">Organizer Revenue</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Settlement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction._id} className="table-row">
                        <td className="px-5 py-4 font-semibold text-ink">{transaction.providerReference}</td>
                        <td className="px-5 py-4 text-muted">{transaction.eventId?.title ?? "Event"}</td>
                        <td className="px-5 py-4 font-semibold text-ink">
                          {formatCurrency(transaction.organizerNetAmount ?? transaction.organizerShare)}
                        </td>
                        <td className="px-5 py-4">
                          <Badge tone={transaction.status === "success" ? "success" : "default"}>
                            {transaction.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-muted">
                          {transaction.settlementStatus?.replace("_", " ") ?? "processing"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/12 text-accent">
                  <WalletCards className="h-5 w-5" />
                </div>
                <h2 className="font-display mt-5 text-2xl font-semibold tracking-[-0.03em] text-ink">
                  No payouts yet
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted">
                  Once paid ticket orders are processed, their payout settlement activity will appear here.
                </p>
              </div>
            )}
          </section>
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
