"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingCard } from "@/components/ui/loading-card";
import { Button } from "@/components/ui/button";
import { useEventsQuery } from "@/hooks/queries/use-events-query";
import { cn } from "@/lib/utils";

const filters = ["All Events", "Networking", "Community", "Art & Culture"];

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Events");
  const deferredSearch = useDeferredValue(search);
  const { data, isLoading } = useEventsQuery({
    search: deferredSearch,
    category: activeFilter === "All Events" ? undefined : activeFilter
  });

  return (
    <div className="page-shell py-10 sm:py-12">
      <section>
        <h1 className="font-display text-2xl md:text-[2.45rem] font-semibold tracking-[-0.05em] text-ink">Explore Events</h1>
        <p className="mt-2 text-sm text-muted">Discover the best events happening near you</p>

        <div className="mt-6 flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="flex h-11 flex-1 items-center gap-3 rounded-full bg-[#f3f2f6] px-4 text-sm text-[#b4aebe]">
            <Search className="h-4 w-4" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by event name, location or date"
              className="w-full bg-transparent text-[#645f70] outline-none placeholder:text-[#b4aebe] py-3.5"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const active = activeFilter === filter;
              return (
                <button
                  key={filter}
                  className={cn(
                    "public-filter-pill max-md:my-1.5",
                    active ? "public-filter-pill-active" : "public-filter-pill-muted"
                  )}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              );
            })}
            <button
              className="public-filter-pill public-filter-pill-muted"
              onClick={() => {
                setActiveFilter("All Events");
                setSearch("");
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => <LoadingCard key={index} className="h-[176px]" />)
          : data?.items.length
            ? data.items.map((event) => <EventCard key={event._id} event={event} variant="list" />)
            : (
              <div className="lg:col-span-2">
                <EmptyState
                  title="No events found"
                  description="Try a different filter or publish a new event to populate the explore page."
                />
              </div>
            )}
      </section>

      {data?.items.length ? (
        <div className="mt-10 flex justify-center">
          <Link href="/dashboard/events/new">
            <Button variant="pill" size="lg">
              Load More Events
            </Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
