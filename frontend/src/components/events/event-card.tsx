import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { Event } from "@/types/domain";
import { cn, formatCurrency, formatEventDate } from "@/lib/utils";

function coverImageStyle(coverImage: string) {
  return {
    backgroundImage: `linear-gradient(180deg, rgba(22,16,30,0.04), rgba(22,16,30,0.48)), url(${coverImage})`
  };
}

function AvatarRow() {
  return (
    <div className="flex -space-x-2">
      {[
        { label: "A", color: "#8A2BE2" },
        { label: "J", color: "#C3CF35" },
        { label: "D", color: "#F25555" }
      ].map((item) => (
        <span
          key={item.label}
          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-white"
          style={{ backgroundColor: item.color }}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function EventCard({
  event,
  variant = "grid"
}: {
  event: Event;
  variant?: "grid" | "compact" | "list";
}) {
  if (variant === "list") {
    return (
      <Link
        href={`/events/${event.slug}`}
        className="grid gap-4 rounded-[16px] border border-line bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift grid-cols-[90px_minmax(0,1fr)] md:grid-cols-[110px_minmax(0,1fr)]"
      >
        <div
          className="max-md:max-h-[120px]  min-h-[10px] md:min-h-[180px] aspect-[0.8] rounded-[12px] bg-cover bg-center"
          style={coverImageStyle(event.coverImage)}
        />
        <div className="min-w-0 ml-0 md:ml-[2em]">
          <h3 className="line-clamp-2 text-[15px] font-semibold uppercase tracking-[-0.02em] text-ink">
            {event.title}
          </h3>
          <div className="mt-2 space-y-1.5 text-[12px] text-muted">
            <div className="inline-flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatEventDate(event.startDate)}
            </div>
            <div className="inline-flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              {event.location}
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <AvatarRow />
              <p className="mt-2 text-[12px] font-medium text-accent">View Event</p>
            </div>
            <span className="text-sm font-semibold text-accent">
              {event.isFree ? "FREE" : formatCurrency(event.ticketPrice)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/events/${event.slug}`}
        className="group relative flex min-h-[258px] overflow-hidden rounded-[14px] shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
      >
        <div className="absolute inset-0 bg-cover bg-center" style={coverImageStyle(event.coverImage)} />
        <div className="relative mt-auto flex w-full items-end justify-between gap-3 bg-gradient-to-t from-[#24112f] via-[#24112f]/82 to-transparent p-4 text-white">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/60">{event.category}</p>
            <h3 className="mt-2 line-clamp-2 text-sm font-semibold tracking-[0.01em]">{event.title}</h3>
          </div>
          <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-accent">
            {event.isFree ? "FREE" : formatCurrency(event.ticketPrice)}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn("group relative flex min-h-[258px] overflow-hidden rounded-[14px] shadow-soft transition hover:-translate-y-1 hover:shadow-lift")}
    >
      <div className="absolute inset-0 bg-cover bg-center" style={coverImageStyle(event.coverImage)} />
      <div className="relative mt-auto w-full bg-gradient-to-t from-[#24112f] via-[#24112f]/82 to-transparent p-4 text-white">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/60">{event.category}</p>
          <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-accent">
            {event.isFree ? "FREE" : formatCurrency(event.ticketPrice)}
          </span>
        </div>
        <h3 className="mt-3 line-clamp-2 text-base font-semibold tracking-[0.01em]">{event.title}</h3>
      </div>
    </Link>
  );
}
