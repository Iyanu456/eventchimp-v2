"use client";

import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { useOrganizerDashboardQuery } from "@/hooks/queries/use-organizer-dashboard-query";
import { formatCurrency } from "@/lib/utils";

export default function DashboardTransactionsPage() {
  const { data } = useOrganizerDashboardQuery();

  return (
    <RoleGuard roles={["organizer", "admin"]}>
      <DashboardShell title="Transactions" subtitle="Review provider references, event revenue, and payment outcomes.">
        {data?.transactions.length ? (
          <div className="surface-panel overflow-hidden">
            <div className="border-b border-line/80 px-5 py-4">
              <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Revenue records</h2>
            </div>
            <DataTable
              columns={["Reference", "Event", "Buyer Total", "Settlement"]}
              rows={data.transactions.map((transaction) => [
                transaction.providerReference,
                transaction.eventId?.title ?? "Event ticket",
                formatCurrency(transaction.buyerTotal ?? transaction.amount),
                transaction.settlementStatus ?? transaction.status
              ])}
            />
          </div>
        ) : (
          <EmptyState
            title="No transactions yet"
            description="Revenue records will appear here when purchases are verified."
          />
        )}
      </DashboardShell>
    </RoleGuard>
  );
}
