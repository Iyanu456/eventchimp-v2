"use client";

import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppMutations } from "@/hooks/mutations/use-app-mutations";
import { useOrganizerDashboardQuery } from "@/hooks/queries/use-organizer-dashboard-query";
import { formatCurrency } from "@/lib/utils";

export default function TicketsPage() {
  const { data } = useOrganizerDashboardQuery();
  const { checkInTicket } = useAppMutations();

  return (
    <RoleGuard roles={["organizer", "admin"]}>
      <DashboardShell title="Tickets" subtitle="Track guests, payment state, and check-in progress.">
        {data?.guestList.length ? (
          <div className="surface-panel overflow-hidden">
            <div className="border-b border-line/80 px-5 py-4">
              <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Guests and check-ins</h2>
            </div>
            <DataTable
              columns={["Event", "Reference", "Amount", "Status", "Action"]}
              rows={data.guestList.map((ticket) => [
                ticket.eventId?.title ?? "Event ticket",
                ticket.paymentReference,
                formatCurrency(ticket.totalPaid),
                ticket.checkedIn ? "Checked in" : ticket.paymentStatus,
                <Button
                  key={ticket._id}
                  variant="secondary"
                  size="sm"
                  disabled={ticket.checkedIn || checkInTicket.isPending}
                  onClick={() => void checkInTicket.mutateAsync(ticket._id)}
                >
                  {ticket.checkedIn ? "Checked in" : "Check in"}
                </Button>
              ])}
            />
          </div>
        ) : (
          <EmptyState
            title="No tickets yet"
            description="Tickets will appear here after checkout verification succeeds."
          />
        )}
      </DashboardShell>
    </RoleGuard>
  );
}
