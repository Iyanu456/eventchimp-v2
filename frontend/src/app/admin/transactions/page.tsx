"use client";

import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DataTable } from "@/components/ui/data-table";
import { useAdminTransactionsQuery } from "@/hooks/queries/use-admin-query";
import { formatCurrency } from "@/lib/utils";

export default function AdminTransactionsPage() {
  const { data } = useAdminTransactionsQuery();

  return (
    <RoleGuard roles={["admin"]}>
      <DashboardShell title="Admin transactions" subtitle="Review provider references, event revenue, and platform collections.">
        <div className="surface-panel overflow-hidden">
          <div className="border-b border-line/80 px-5 py-4">
            <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Platform transactions</h2>
          </div>
          <DataTable
            columns={["Reference", "Event", "Amount", "Status"]}
            rows={(data ?? []).map((transaction) => [
              transaction.providerReference,
              transaction.eventId?.title ?? "Event",
              formatCurrency(transaction.amount),
              transaction.status
            ])}
          />
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
