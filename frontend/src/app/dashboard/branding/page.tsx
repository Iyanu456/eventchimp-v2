"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Palette, Sparkles } from "lucide-react";
import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useBrandingTemplatesQuery } from "@/hooks/queries/use-branding-templates-query";
import { useOrganizerDashboardQuery } from "@/hooks/queries/use-organizer-dashboard-query";
import { useAppMutations } from "@/hooks/mutations/use-app-mutations";

export default function BrandingPage() {
  const { data: dashboard } = useOrganizerDashboardQuery();
  const eventId = dashboard?.events[0]?._id;
  const { data } = useBrandingTemplatesQuery(eventId);
  const { generateBrandingAssetMetadata } = useAppMutations();
  const [eventName, setEventName] = useState("");
  const [venue, setVenue] = useState("");

  useEffect(() => {
    if (dashboard?.events[0]) {
      setEventName(dashboard.events[0].title);
      setVenue(dashboard.events[0].location);
    }
  }, [dashboard]);

  return (
    <RoleGuard roles={["organizer", "admin"]}>
      <DashboardShell
        title="Branding kit"
        subtitle="Keep event collateral aligned with the same visual system as the live event experience."
      >
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <form
            className="surface-panel p-5 md:p-6"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!eventId || !dashboard?.events[0]) {
                return;
              }

              await generateBrandingAssetMetadata.mutateAsync({
                eventId,
                type: "instagram_frame",
                eventName,
                date: new Date(dashboard.events[0].startDate).toLocaleDateString(),
                venue,
                organizerName: dashboard.events[0].organizerId?.name ?? "Organizer",
                accentColor: "#8828D2"
              });
            }}
          >
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
              <Palette className="h-4 w-4 text-accent" />
              Template metadata
            </div>
            <h2 className="font-display mt-4 text-[1.9rem] font-bold tracking-[-0.04em] text-ink">
              Edit branding details
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Update the event name and venue once, then reuse that language across every preview board.
            </p>
            <div className="mt-8 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink">Event name</span>
                <Input value={eventName} onChange={(event) => setEventName(event.target.value)} placeholder="Event name" />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink">Venue</span>
                <Input value={venue} onChange={(event) => setVenue(event.target.value)} placeholder="Venue" />
              </label>
              <Button type="submit" variant="pill" disabled={generateBrandingAssetMetadata.isPending} className="w-full">
                {generateBrandingAssetMetadata.isPending ? "Saving..." : "Save metadata"}
              </Button>
            </div>
          </form>

          <div className="space-y-6">
            <div className="surface-panel overflow-hidden p-3">
              <Image
                src="/branding-kit-preview.svg"
                alt="Branding board preview"
                width={1280}
                height={960}
                className="w-full rounded-[8px] border border-line/70"
              />
            </div>

            {data?.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {data.flatMap((item) => item.assets).map((asset) => (
                  <div key={asset._id} className="surface-panel overflow-hidden">
                    <div className="h-56 bg-cover bg-center" style={{ backgroundImage: `url(${asset.previewUrl})` }} />
                    <div className="p-5">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                        <Sparkles className="h-4 w-4 text-accent" />
                        {asset.type.replace("_", " ")}
                      </div>
                      <p className="font-display mt-3 text-[1.6rem] font-bold tracking-[-0.04em] text-ink">
                        {asset.customization.eventName}
                      </p>
                      <p className="mt-2 text-sm text-muted">{asset.customization.venue}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No branding assets yet"
                description="Save metadata for an event and the preview-driven branding templates will appear here."
              />
            )}
          </div>
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
