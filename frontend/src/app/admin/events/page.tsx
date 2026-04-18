"use client";

import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DataTable } from "@/components/ui/data-table";
import { useAdminEventsQuery } from "@/hooks/queries/use-admin-query";
import { formatEventDate } from "@/lib/utils";

export default function AdminEventsPage() {
  const { data } = useAdminEventsQuery();

  return (
    <RoleGuard roles={["admin"]}>
      <DashboardShell title="Admin events" subtitle="Review event volume, organizers, and scheduling in one denser view.">
        <div className="surface-panel overflow-hidden">
          <div className="border-b border-line/80 px-5 py-4">
            <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Platform events</h2>
          </div>
          <DataTable
            columns={["Event", "Organizer", "Date", "Status"]}
            rows={(data ?? []).map((event) => [
              <div key={`${event._id}-name`}>
                <p className="font-semibold text-ink">{event.title}</p>
                <p className="mt-1 text-xs text-muted">{event.category}</p>
              </div>,
              event.organizerId?.name ?? "Organizer",
              formatEventDate(event.startDate),
              event.status.replace("_", " ")
            ])}
          />
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
