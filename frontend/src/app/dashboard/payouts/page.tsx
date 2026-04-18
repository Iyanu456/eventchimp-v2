"use client";

import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/ui/stat-card";
import { useOrganizerDashboardQuery } from "@/hooks/queries/use-organizer-dashboard-query";
import { formatCurrency } from "@/lib/utils";

export default function PayoutsPage() {
  const { data } = useOrganizerDashboardQuery();
  const organizerShare = data?.transactions.reduce((sum, item) => sum + item.organizerShare, 0) ?? 0;
  const platformShare = data?.transactions.reduce((sum, item) => sum + item.platformRevenue, 0) ?? 0;

  return (
    <RoleGuard roles={["organizer", "admin"]}>
      <DashboardShell title="Payouts" subtitle="Track organizer share, platform revenue, and payout readiness.">
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Organizer share" value={formatCurrency(organizerShare)} />
            <StatCard label="Platform revenue" value={formatCurrency(platformShare)} />
            <StatCard label="Transactions" value={String(data?.transactions.length ?? 0)} />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="surface-panel p-5 md:p-6">
              <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Payout schedule</p>
              <div className="mt-5 rounded-[8px] bg-surface-subtle p-4">
                <p className="font-display text-[1.6rem] font-bold tracking-[-0.04em] text-ink">Next payout</p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Organizer disbursements can be staged here once banking is enabled. The shell is ready for that next product step.
                </p>
              </div>
            </div>
            <div className="surface-panel p-5 md:p-6">
              <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Readiness</p>
              <div className="mt-5 rounded-[8px] bg-accent/5 p-4 text-sm leading-7 text-muted">
                Connect your payout details when organizer banking is available. Until then, this screen keeps the visual structure ready without altering the existing backend flow.
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
