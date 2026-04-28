"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertCircle, CalendarDays, Crown, Eye, FileText, ListChecks, LoaderCircle, Trash2, X } from "lucide-react";
import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrganizerDashboardQuery } from "@/hooks/queries/use-organizer-dashboard-query";
import { useAppMutations } from "@/hooks/mutations/use-app-mutations";
import { cn, formatCurrency, formatEventDate } from "@/lib/utils";
import type { Event } from "@/types/domain";

const filters = [
  { label: "All Events", value: "all", icon: ListChecks },
  { label: "Published", value: "published", icon: Eye },
  { label: "Drafts", value: "draft", icon: FileText },
  { label: "Ended", value: "ended", icon: Crown }
] as const;

export default function DashboardEventsPage() {
  const { data, isLoading } = useOrganizerDashboardQuery();
  const { deleteEvent } = useAppMutations();
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]["value"]>("all");
  const [eventPendingDelete, setEventPendingDelete] = useState<Event | null>(null);

  const events = useMemo(() => {
    if (!data?.events) return [];
    if (activeFilter === "all") return data.events;
    if (activeFilter === "ended") return data.events.filter((event) => ["sold_out", "cancelled"].includes(event.status));
    return data.events.filter((event) => event.status === activeFilter);
  }, [activeFilter, data?.events]);

  return (
    <RoleGuard roles={["organizer", "admin"]}>
      <DashboardShell title="Events">
        <div className="space-y-5">
          {!data?.payout?.payoutReady ? (
            <div className="flex flex-wrap items-start justify-between gap-4 rounded-[18px] border border-[#f1d8a8] bg-[#fff9ed] px-5 py-4 text-sm text-[#8a5a13]">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#ca8a2b] shadow-soft">
                  <AlertCircle className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-[#6f410a]">Complete your payout profile before creating events</p>
                  <p className="mt-1 leading-6">
                    EventChimp now publishes events immediately, so a verified payout profile is required before the create flow opens.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/settings"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#6f410a] shadow-soft transition hover:text-accent"
              >
                Go to Account
              </Link>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => {
              const active = activeFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition",
                    active ? "bg-accent text-white shadow-halo" : "bg-[#e8e6eb] text-[#6f697b]"
                  )}
                  onClick={() => setActiveFilter(filter.value)}
                >
                  <filter.icon className="h-4 w-4" />
                  {filter.label}
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div className="surface-panel h-[320px] animate-pulse" />
          ) : events.length ? (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event._id} className="surface-panel grid gap-5 p-5 xl:grid-cols-[200px_minmax(0,1fr)_150px]">
                  <div
                    className="min-h-[164px] rounded-[16px] bg-cover bg-center"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(22,16,30,0.08), rgba(22,16,30,0.42)), url(${event.coverImage})`
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={event.status === "published" ? "success" : "default"}>
                        {event.status.replace("_", " ")}
                      </Badge>
                      <Badge tone="accent">{event.category}</Badge>
                    </div>
                    <h2 className="font-display mt-4 text-[1.7rem] font-semibold tracking-[-0.04em] text-ink">{event.title}</h2>
                    <div className="mt-4 grid gap-2 text-sm text-muted md:grid-cols-3">
                      <div className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-accent" /> {formatEventDate(event.startDate)}</div>
                      <div>{event.location}</div>
                      <div>{event.isFree ? "FREE" : formatCurrency(event.ticketPrice)}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 xl:items-end">
                    <Link href={`/dashboard/events/${event._id}`}>
                      <Button variant="secondary" className="w-full xl:w-auto">Manage</Button>
                    </Link>
                    <button
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f0eff4] px-4 py-2 text-sm font-medium text-[#6f697b] transition hover:bg-[#fdebea] hover:text-danger xl:w-auto"
                      onClick={() => setEventPendingDelete(event)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-wave-card rounded-[24px] px-6 py-14 text-center text-white sm:px-10">
              <div className="mx-auto max-w-[520px]">
                <span className="rounded-full bg-[#4d145b] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
                  Events
                </span>
                <h2 className="font-display mt-6 text-[2.4rem] font-semibold tracking-[-0.05em]">
                  You have no events yet!
                </h2>
                <p className="mt-2 text-sm text-white/75">Create an event to get Started</p>
                <div className="mt-8 flex justify-center">
                  <Link href="/dashboard/events/new">
                    <Button variant="secondary" className="rounded-full border-transparent bg-white px-6 text-[#41215f] hover:bg-white/90">
                      Create an Event
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {eventPendingDelete ? (
          <div
            className="fixed inset-0 z-[80] flex items-start justify-center bg-[#12091f]/45 px-4 py-8 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-event-title"
          >
            <div className="mt-20 w-full max-w-[460px] rounded-[24px] border border-line bg-white p-5 shadow-[0_28px_80px_rgba(31,18,52,0.24)]">
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fdebea] text-danger">
                  <Trash2 className="h-5 w-5" />
                </span>
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface text-muted transition hover:bg-[#ebe7f1] hover:text-ink"
                  onClick={() => setEventPendingDelete(null)}
                  disabled={deleteEvent.isPending}
                  aria-label="Close delete confirmation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5">
                <h2 id="delete-event-title" className="font-display text-[1.55rem] font-semibold tracking-[-0.04em] text-ink">
                  Are you sure you want to delete this event?
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  This will remove <span className="font-semibold text-ink">{eventPendingDelete.title}</span> from your organizer
                  dashboard. This action cannot be undone.
                </p>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setEventPendingDelete(null)}
                  disabled={deleteEvent.isPending}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="rounded-full"
                  disabled={deleteEvent.isPending}
                  onClick={async () => {
                    await deleteEvent.mutateAsync(eventPendingDelete._id);
                    setEventPendingDelete(null);
                  }}
                >
                  {deleteEvent.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete event
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </DashboardShell>
    </RoleGuard>
  );
}
