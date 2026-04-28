"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, ArrowRight, LoaderCircle, QrCode, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAppMutations } from "@/hooks/mutations/use-app-mutations";
import { useEventCollaboratorsQuery, useEventMetricsQuery } from "@/hooks/queries/use-event-operations-query";
import { formatCurrency, getRequestErrorMessage } from "@/lib/utils";

export function EventOperationsPanel({ eventId }: { eventId: string }) {
  const { data: collaboratorsData } = useEventCollaboratorsQuery(eventId);
  const { data: metrics } = useEventMetricsQuery(eventId);
  const { inviteEventCollaborator } = useAppMutations();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"manager" | "scanner" | "viewer">("scanner");
  const [error, setError] = useState<string | null>(null);
  const canInvite = collaboratorsData?.currentRole === "owner" || collaboratorsData?.currentRole === "admin";

  return (
    <div className="space-y-6">
      <section className="surface-panel p-5 md:p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1eb] text-[#ff5a1f]">
            <Activity className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[1.3rem] font-semibold tracking-[-0.03em] text-ink">Event metrics</p>
            <p className="mt-2 text-sm leading-7 text-muted">Live signals from orders, tickets, refunds, and check-ins.</p>
          </div>
        </div>

        {metrics ? (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-[16px] bg-surface-subtle px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Tickets sold</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">{metrics.totalTicketsSold}</p>
              </div>
              <div className="rounded-[16px] bg-surface-subtle px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Check-in rate</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">{metrics.checkInRate}%</p>
              </div>
              <div className="rounded-[16px] bg-surface-subtle px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Orders</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">{metrics.totalOrders}</p>
              </div>
              {metrics.accessLevel === "full" ? (
                <>
                  <div className="rounded-[16px] bg-surface-subtle px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Gross revenue</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">{formatCurrency(metrics.grossRevenue ?? 0)}</p>
                  </div>
                  <div className="rounded-[16px] bg-surface-subtle px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Organizer revenue</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">{formatCurrency(metrics.organizerNetRevenue ?? 0)}</p>
                  </div>
                  <div className="rounded-[16px] bg-surface-subtle px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Service fees</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">{formatCurrency(metrics.serviceFees ?? 0)}</p>
                  </div>
                </>
              ) : null}
            </div>

            <div className="mt-5 rounded-[18px] border border-line bg-[#faf7fd] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">Scanner workspace</p>
                  <p className="mt-1 text-xs leading-6 text-muted">Open the camera flow or manual token entry for live check-ins.</p>
                </div>
                <Link href={`/dashboard/events/${eventId}/scanner`}>
                  <Button variant="pill" className="bg-[#ff5a1f] hover:bg-[#e64d16]">
                    <QrCode className="h-4 w-4" />
                    Open scanner
                  </Button>
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-[16px] bg-surface-subtle px-4 py-4 text-sm text-muted">Loading live event metrics...</div>
        )}
      </section>

      <section className="surface-panel p-5 md:p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1eb] text-[#ff5a1f]">
            <Users className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[1.3rem] font-semibold tracking-[-0.03em] text-ink">Collaborators</p>
            <p className="mt-2 text-sm leading-7 text-muted">Invite managers, scanners, and viewers without exposing payout data.</p>
          </div>
        </div>

        {canInvite ? (
          <form
            className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]"
            onSubmit={async (event) => {
              event.preventDefault();
              setError(null);

              try {
                await inviteEventCollaborator.mutateAsync({
                  eventId,
                  payload: {
                    email,
                    role
                  }
                });
                setEmail("");
              } catch (mutationError) {
                setError(getRequestErrorMessage(mutationError, "We could not send that invitation right now."));
              }
            }}
          >
            <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="collaborator@example.com" />
            <Select value={role} onChange={(event) => setRole(event.target.value as "manager" | "scanner" | "viewer")}>
              <option value="scanner">Scanner</option>
              <option value="manager">Manager</option>
              <option value="viewer">Viewer</option>
            </Select>
            <Button type="submit" variant="pill" className="bg-[#ff5a1f] hover:bg-[#e64d16]" disabled={inviteEventCollaborator.isPending}>
              {inviteEventCollaborator.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Invite
            </Button>
          </form>
        ) : (
          <div className="mt-5 rounded-[16px] bg-surface-subtle px-4 py-4 text-sm text-muted">
            Only the event owner can send new collaborator invitations.
          </div>
        )}

        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

        <div className="mt-5 space-y-3">
          {(collaboratorsData?.collaborators ?? []).map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-[16px] border border-line bg-surface-subtle px-4 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{item.user?.name ?? "Event owner"}</p>
                <p className="truncate text-xs leading-6 text-muted">{item.user?.email ?? "Primary organizer"}</p>
              </div>
              <Badge tone="default" className="capitalize">
                {item.role}
              </Badge>
            </div>
          ))}
        </div>

        {(collaboratorsData?.invitations?.length ?? 0) > 0 ? (
          <div className="mt-5 rounded-[18px] border border-line bg-[#faf7fd] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">Pending invitations</p>
                <p className="mt-1 text-xs leading-6 text-muted">Recipients sign in first, then EventChimp grants the event role.</p>
              </div>
              <ArrowRight className="h-4 w-4 text-[#ff5a1f]" />
            </div>
            <div className="mt-3 space-y-2">
              {collaboratorsData?.invitations.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-[14px] bg-white px-3 py-3 text-sm">
                  <span className="truncate text-ink">{item.email}</span>
                  <Badge tone="default" className="capitalize">
                    {item.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
