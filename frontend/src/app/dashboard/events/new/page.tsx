"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EventForm } from "@/components/events/event-form";
import { useAppMutations } from "@/hooks/mutations/use-app-mutations";
import { getRequestErrorMessage } from "@/lib/utils";

export default function NewEventPage() {
  const router = useRouter();
  const { createEvent } = useAppMutations();
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <RoleGuard roles={["organizer", "admin"]}>
      <DashboardShell
        title="Create Event"
        subtitle="Structure the event details, publishing status and media in a cleaner launch flow."
      >
        {formError ? (
          <div className="mb-6 flex items-start gap-3 rounded-[16px] border border-[#f0ccd2] bg-[#fff6f7] px-4 py-3 text-sm text-[#923647]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{formError}</p>
          </div>
        ) : null}
        <EventForm
          submitLabel="Create event"
          isSubmitting={createEvent.isPending}
          onSubmit={async (values) => {
            setFormError(null);

            try {
              await createEvent.mutateAsync({
                ...values,
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
      </DashboardShell>
    </RoleGuard>
  );
}
