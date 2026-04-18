"use client";

import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EventForm } from "@/components/events/event-form";
import { useAppMutations } from "@/hooks/mutations/use-app-mutations";

export default function NewEventPage() {
  const router = useRouter();
  const { createEvent } = useAppMutations();

  return (
    <RoleGuard roles={["organizer", "admin"]}>
      <DashboardShell
        title="Create Event"
        subtitle="Structure the event details, publishing status and media in a cleaner launch flow."
      >
        <EventForm
          submitLabel="Create event"
          isSubmitting={createEvent.isPending}
          onSubmit={async (values) => {
            await createEvent.mutateAsync({
              ...values,
              startDate: new Date(values.startDate).toISOString(),
              endDate: new Date(values.endDate).toISOString()
            });
            router.push("/dashboard/events");
          }}
        />
      </DashboardShell>
    </RoleGuard>
  );
}
