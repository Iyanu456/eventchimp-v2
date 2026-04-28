"use client";

import { useEffect, useState } from "react";
import { Bell, LoaderCircle } from "lucide-react";
import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PayoutProfileForm } from "@/components/dashboard/payout-profile-form";
import { useAppMutations } from "@/hooks/mutations/use-app-mutations";
import { usePayoutStatusQuery } from "@/hooks/queries/use-payout-status-query";
import { useSessionStore } from "@/stores/session-store";

export default function SettingsPage() {
  const currentUser = useSessionStore((state) => state.currentUser);
  const { data: payoutStatus } = usePayoutStatusQuery();
  const { updateOrganizerSettings } = useAppMutations();
  const [ticketPurchaseEmail, setTicketPurchaseEmail] = useState(
    Boolean(payoutStatus?.organizerNotifications?.ticketPurchaseEmail)
  );

  useEffect(() => {
    setTicketPurchaseEmail(Boolean(payoutStatus?.organizerNotifications?.ticketPurchaseEmail));
  }, [payoutStatus?.organizerNotifications?.ticketPurchaseEmail]);

  const notificationDirty =
    ticketPurchaseEmail !== Boolean(payoutStatus?.organizerNotifications?.ticketPurchaseEmail);

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
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1eb] text-[#ff5a1f]">
                  <Bell className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Organizer notifications</p>
                  <p className="mt-2 text-sm leading-7 text-muted">
                    Decide whether EventChimp should email you every time a buyer completes a ticket order.
                  </p>
                </div>
              </div>
              <label className="mt-5 flex items-center justify-between gap-4 rounded-[16px] border border-line bg-surface-subtle px-4 py-4 text-sm text-ink">
                <div>
                  <p className="font-semibold">Ticket purchase emails</p>
                  <p className="mt-1 text-xs leading-6 text-muted">Off by default so your inbox only gets the signals you want.</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#ff5a1f]"
                  checked={ticketPurchaseEmail}
                  onChange={(event) => setTicketPurchaseEmail(event.target.checked)}
                />
              </label>
              <Button
                variant="pill"
                className="mt-6 w-full bg-[#ff5a1f] hover:bg-[#e64d16]"
                disabled={!notificationDirty || updateOrganizerSettings.isPending}
                onClick={async () => {
                  await updateOrganizerSettings.mutateAsync({
                    organizerNotifications: {
                      ticketPurchaseEmail
                    }
                  });
                }}
              >
                {updateOrganizerSettings.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                Save notification settings
              </Button>
            </div>
          </div>
          <PayoutProfileForm />
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
