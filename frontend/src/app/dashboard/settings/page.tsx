"use client";

import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PayoutProfileForm } from "@/components/dashboard/payout-profile-form";
import { useSessionStore } from "@/stores/session-store";

export default function SettingsPage() {
  const currentUser = useSessionStore((state) => state.currentUser);

  return (
    <RoleGuard roles={["organizer", "admin"]}>
      <DashboardShell title="Account" subtitle="Manage your account identity, payout profile, and workspace defaults.">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="surface-panel p-5 md:p-6">
            <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Profile</p>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Full name</span>
                <Input value={currentUser?.name ?? ""} readOnly />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Email address</span>
                <Input value={currentUser?.email ?? ""} readOnly />
              </label>
            </div>
          </div>
          <div className="xl:row-span-2">
            <div className="surface-panel p-5 md:p-6">
              <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Workspace</p>
              <div className="mt-5 space-y-3 text-sm text-muted">
                <div className="rounded-[8px] bg-surface-subtle px-4 py-4">
                  Branding preferences can live here without changing the shell structure again later.
                </div>
                <div className="rounded-[8px] bg-surface-subtle px-4 py-4">
                  Notification preferences can slot into the same cleaner account pattern.
                </div>
              </div>
              <Button variant="pill" className="mt-6 w-full" disabled>
                Save account
              </Button>
            </div>
          </div>
          <PayoutProfileForm />
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
