"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EventForm } from "@/components/events/event-form";
import { useAppMutations } from "@/hooks/mutations/use-app-mutations";
import { usePayoutStatusQuery } from "@/hooks/queries/use-payout-status-query";
import { Button } from "@/components/ui/button";
import { getRequestErrorMessage } from "@/lib/utils";

export default function NewEventPage() {
  const router = useRouter();
  const { createEvent } = useAppMutations();
  const { data: payoutStatus } = usePayoutStatusQuery();
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <RoleGuard roles={["organizer", "admin"]}>
      <DashboardShell
        title="Create Event"
        subtitle="Structure the event details, publishing status and media in a cleaner launch flow."
      >
        {!payoutStatus?.payoutReady ? (
          <div className="mb-6 rounded-[22px] border border-[#ffd7c9] bg-[#fff7f3] p-5 shadow-soft">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#ff5a1f] shadow-soft">
                  <LockKeyhole className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[1.1rem] font-semibold tracking-[-0.02em] text-ink">Verify payout before creating an event</p>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
                    Every event now goes live immediately after creation, so EventChimp requires a verified payout profile first.
                    Finish your account setup once and your launch flow stays clean from there.
                  </p>
                </div>
              </div>
              <Link href="/dashboard/settings" className="shrink-0">
                <Button variant="pill" className="rounded-full bg-[#ff5a1f] hover:bg-[#e64d16]">
                  Open Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
        {formError ? (
          <div className="mb-6 flex items-start gap-3 rounded-[16px] border border-[#f0ccd2] bg-[#fff6f7] px-4 py-3 text-sm text-[#923647]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{formError}</p>
          </div>
        ) : null}
        {payoutStatus?.payoutReady ? (
          <EventForm
            submitLabel="Create event"
            isSubmitting={createEvent.isPending}
            payoutReady={Boolean(payoutStatus?.payoutReady)}
            showStatusField={false}
            onSubmit={async (values) => {
              setFormError(null);

              try {
                await createEvent.mutateAsync({
                  ...values,
                  status: "published",
                  startDate: new Date(values.startDate).toISOString(),
                  endDate: new Date(values.endDate).toISOString(),
                  recurrence: values.scheduleType === "recurring" && values.recurrence
                    ? {
                        ...values.recurrence,
                        until: values.recurrence.until ? new Date(values.recurrence.until).toISOString() : null
                      }
                    : null
                });
                router.push("/dashboard/events");
              } catch (error) {
                setFormError(getRequestErrorMessage(error, "We couldn't create the event right now."));
              }
            }}
          />
        ) : null}
      </DashboardShell>
    </RoleGuard>
  );
}
