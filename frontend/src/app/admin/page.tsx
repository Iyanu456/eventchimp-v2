"use client";

import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { useAdminOverviewQuery } from "@/hooks/queries/use-admin-query";
import { formatCurrency } from "@/lib/utils";

export default function AdminPage() {
  const { data } = useAdminOverviewQuery();

  return (
    <RoleGuard roles={["admin"]}>
      <DashboardShell
        title="Admin overview"
        subtitle="Monitor platform health, recent activity, and revenue in one founder-ready workspace."
      >
        {data ? (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Users" value={String(data.metrics.usersCount)} />
              <StatCard label="Events" value={String(data.metrics.eventsCount)} />
              <StatCard label="Transactions" value={String(data.metrics.transactionsCount)} />
              <StatCard label="Gross revenue" value={formatCurrency(data.metrics.grossRevenue)} />
            </div>
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="surface-panel p-5 md:p-6">
              <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Recent users</p>
              <div className="mt-5 space-y-3">
                {data.recentUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="rounded-[8px] bg-surface-subtle p-4">
                      <p className="font-semibold text-ink">{user.name}</p>
                      <p className="mt-1 text-xs text-muted">{user.email}</p>
                    </div>
                  ))}
                </div>
            </div>
            <div className="surface-panel p-5 md:p-6">
              <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Recent events</p>
              <div className="mt-5 space-y-3">
                {data.recentEvents.slice(0, 5).map((event) => (
                  <div key={event._id} className="rounded-[8px] bg-surface-subtle p-4">
                      <p className="font-semibold text-ink">{event.title}</p>
                      <p className="mt-1 text-xs text-muted">{event.organizerId?.name ?? "Organizer"}</p>
                    </div>
                  ))}
                </div>
            </div>
            <div className="surface-panel p-5 md:p-6">
              <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Recent transactions</p>
              <div className="mt-5 space-y-3">
                {data.recentTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction._id} className="rounded-[8px] bg-surface-subtle p-4">
                      <p className="font-semibold text-ink">{transaction.providerReference}</p>
                      <p className="mt-1 text-xs text-muted">{formatCurrency(transaction.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState title="No admin data yet" description="Sign in as an admin to load platform activity." />
        )}
      </DashboardShell>
    </RoleGuard>
  );
}
