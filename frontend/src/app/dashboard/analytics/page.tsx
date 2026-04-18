"use client";

import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { useOrganizerDashboardQuery } from "@/hooks/queries/use-organizer-dashboard-query";
import { formatCurrency } from "@/lib/utils";

export default function AnalyticsPage() {
  const { data } = useOrganizerDashboardQuery();

  if (!data) {
    return (
      <RoleGuard roles={["organizer", "admin"]}>
        <DashboardShell title="Analytics" subtitle="Visualize sales, attendance, and event mix.">
          <EmptyState title="No analytics yet" description="Create an event to start collecting analytics." />
        </DashboardShell>
      </RoleGuard>
    );
  }

  const highestPrice = Math.max(...data.events.map((event) => event.ticketPrice), 0);

  return (
    <RoleGuard roles={["organizer", "admin"]}>
      <DashboardShell title="Analytics" subtitle="Visualize sales, attendance, and event mix.">
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Active events" value={String(data.events.length)} />
            <StatCard label="Guest list" value={String(data.guestList.length)} />
            <StatCard label="Top ticket price" value={formatCurrency(highestPrice)} />
            <StatCard label="Gross revenue" value={formatCurrency(data.metrics.revenue)} />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="surface-panel p-5 md:p-6">
              <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Attendance mix</p>
              <div className="mt-5 space-y-4">
                {data.events.map((event) => (
                  <div key={event._id}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-ink">{event.title}</span>
                      <span className="text-muted">{event.attendeesCount} guests</span>
                    </div>
                    <div className="h-3 rounded-full bg-surface">
                      <div
                        className="h-3 rounded-full bg-accent"
                        style={{ width: `${Math.min((event.attendeesCount / Math.max(data.metrics.attendeesCount, 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="surface-panel p-5 md:p-6">
              <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Status mix</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {["published", "draft", "sold_out", "cancelled"].map((status) => {
                  const count = data.events.filter((event) => event.status === status).length;
                  return (
                    <div key={status} className="rounded-[8px] border border-line bg-surface-subtle p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted">{status.replace("_", " ")}</p>
                      <p className="font-display mt-2 text-[2rem] font-bold text-ink">{count}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
