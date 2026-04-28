"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { notFound, useRouter } from "next/navigation";
import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EventForm } from "@/components/events/event-form";
import { EventOperationsPanel } from "@/components/events/event-operations-panel";
import { useAppMutations } from "@/hooks/mutations/use-app-mutations";
import { useOrganizerDashboardQuery } from "@/hooks/queries/use-organizer-dashboard-query";
import { usePayoutStatusQuery } from "@/hooks/queries/use-payout-status-query";
import { getRequestErrorMessage } from "@/lib/utils";

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data } = useOrganizerDashboardQuery();
  const { data: payoutStatus } = usePayoutStatusQuery();
  const { updateEvent } = useAppMutations();
  const [formError, setFormError] = useState<string | null>(null);
  const event = data?.events.find((item) => item._id === params.id);

  if (data && !event) {
    notFound();
  }

  return (
    <RoleGuard roles={["organizer", "admin"]}>
      <DashboardShell
        title="Edit Event"
        subtitle="Refine the event presentation, schedule and publishing settings."
      >
        {formError ? (
          <div className="mb-6 flex items-start gap-3 rounded-[16px] border border-[#f0ccd2] bg-[#fff6f7] px-4 py-3 text-sm text-[#923647]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{formError}</p>
          </div>
        ) : null}
        {event ? (
          <div className="space-y-6">
            <EventForm
              submitLabel="Save changes"
              isSubmitting={updateEvent.isPending}
              payoutReady={Boolean(payoutStatus?.payoutReady)}
              initialValues={{
                title: event.title,
                category: event.category,
                description: event.description,
                location: event.location,
                startDate: event.startDate.slice(0, 16),
                endDate: event.endDate.slice(0, 16),
                capacity: event.capacity,
                ticketPrice: event.ticketPrice,
                isFree: event.isFree,
                status: event.status,
                tags: event.tags,
                scheduleType: event.scheduleType ?? "single",
                recurrence: event.recurrence
                  ? {
                      ...event.recurrence,
                      until: event.recurrence.until ? event.recurrence.until.slice(0, 10) : ""
                    }
                  : null,
                attendanceMode: event.attendanceMode ?? "in_person",
                streaming: event.streaming ?? null,
                ticketTiers: event.ticketTiers,
                guests: event.guests,
                customFields: event.customFields
              }}
              onSubmit={async (values) => {
                setFormError(null);

                try {
                  await updateEvent.mutateAsync({
                    id: event._id,
                    payload: {
                      ...values,
                      startDate: new Date(values.startDate).toISOString(),
                      endDate: new Date(values.endDate).toISOString(),
                      recurrence: values.scheduleType === "recurring" && values.recurrence
                        ? {
                            ...values.recurrence,
                            until: values.recurrence.until ? new Date(values.recurrence.until).toISOString() : null
                          }
                        : null
                    }
                  });
                  router.push("/dashboard/events");
                } catch (error) {
                  setFormError(getRequestErrorMessage(error, "We couldn't save those event changes."));
                }
              }}
            />
            <EventOperationsPanel eventId={event._id} />
          </div>
        ) : (
          <div className="surface-panel p-6 text-sm text-muted">Loading event...</div>
        )}
      </DashboardShell>
    </RoleGuard>
  );
}
