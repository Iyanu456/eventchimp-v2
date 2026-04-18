"use client";

import { notFound, useRouter } from "next/navigation";
import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EventForm } from "@/components/events/event-form";
import { useAppMutations } from "@/hooks/mutations/use-app-mutations";
import { useOrganizerDashboardQuery } from "@/hooks/queries/use-organizer-dashboard-query";

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data } = useOrganizerDashboardQuery();
  const { updateEvent } = useAppMutations();
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
        {event ? (
          <EventForm
            submitLabel="Save changes"
            isSubmitting={updateEvent.isPending}
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
              tags: event.tags
            }}
            onSubmit={async (values) => {
              await updateEvent.mutateAsync({
                id: event._id,
                payload: {
                  ...values,
                  startDate: new Date(values.startDate).toISOString(),
                  endDate: new Date(values.endDate).toISOString()
                }
              });
              router.push("/dashboard/events");
            }}
          />
        ) : (
          <div className="surface-panel p-6 text-sm text-muted">Loading event...</div>
        )}
      </DashboardShell>
    </RoleGuard>
  );
}
