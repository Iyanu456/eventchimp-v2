"use client";

import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DataTable } from "@/components/ui/data-table";
import { useAdminUsersQuery } from "@/hooks/queries/use-admin-query";

export default function AdminUsersPage() {
  const { data } = useAdminUsersQuery();

  return (
    <RoleGuard roles={["admin"]}>
      <DashboardShell title="Admin users" subtitle="Keep an eye on user growth, role mix, and account activity.">
        <div className="surface-panel overflow-hidden">
          <div className="border-b border-line/80 px-5 py-4">
            <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">User accounts</h2>
          </div>
          <DataTable
            columns={["Name", "Email", "Role", "Provider"]}
            rows={(data ?? []).map((user) => [user.name, user.email, user.role, user.provider])}
          />
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
