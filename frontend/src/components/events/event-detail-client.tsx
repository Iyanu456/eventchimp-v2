"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  Copy,
  Link2,
  MapPin,
  MessageCircle,
  Radio,
  Send,
  Share2,
  Ticket,
  Users,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAppMutations } from "@/hooks/mutations/use-app-mutations";
import { EventDetailResponse } from "@/types/domain";
import { formatCurrency, formatEventDate } from "@/lib/utils";

type EventDetailClientProps = {
  data: EventDetailResponse;
  canonicalUrl: string;
};

type ShareOption = {
  label: string;
  href: string;
};

export function EventDetailClient({ data, canonicalUrl }: EventDetailClientProps) {
  const { createEventPost } = useAppMutations();
  const coverImage = data.event.coverImage || "/eventchimp-event-preview.svg";
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(data.messages);
  const [shareOpen, setShareOpen] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const primaryTicket = useMemo(() => {
    const tiers = [...(data.event.ticketTiers ?? [])].sort((a, b) => a.order - b.order);
    return tiers[0];
  }, [data.event.ticketTiers]);

  const shareText = `Join me at ${data.event.title} on EventChimp`;
  const shareOptions: ShareOption[] = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${canonicalUrl}`)}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(canonicalUrl)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}` },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`
    }
  ];

  const descriptionMarkup = /<\/?[a-z][\s\S]*>/i.test(data.event.description)
    ? data.event.description
    : data.event.description
        .split(/\n{2,}/)
        .map((paragraph) => `<p>${paragraph}</p>`)
        .join("");

  const nativeShareAvailable = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className="page-shell py-10">
      <section className="dashboard-wave-card rounded-[24px] px-5 py-6 text-white sm:px-7 sm:py-7 lg:px-9">
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
          <div className="rounded-[18px] shadow-soft">
            <div
              className="aspect-[0.86] rounded-[14px] bg-cover bg-center"
              style={{ backgroundImage: `url(${coverImage})` }}
            />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="justify-between md:flex">
          <div>
            <h1 className="font-display text-[2.1rem] font-semibold uppercase tracking-[-0.04em] leading-[1.3em] md:leading-[1.2em] sm:text-[2.55rem] md:max-w-[70%]">
              {data.event.title}
            </h1>
            <div className="mt-2.5 flex gap-3 max-md:mt-3.5 max-md:flex-col">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>{formatEventDate(data.event.startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{data.event.location}</span>
              </div>
              {data.event.attendanceMode !== "in_person" && data.event.streaming ? (
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4" />
                  <span>{data.event.streaming.provider}</span>
                </div>
              ) : null}
            </div>
          </div>
          <div className="space-y-3 max-md:mt-[2em]">
            <Link href={`/events/${data.event.slug}/checkout`}>
              <Button variant="pill" size="lg" className="flex gap-4 px-[4em] max-md:w-full">
                Get Ticket
                <span className="hidden max-md:block">-</span>
                <span className="hidden max-md:block">{data.event.isFree ? "FREE" : formatCurrency(primaryTicket?.price ?? data.event.ticketPrice)}</span>
              </Button>
            </Link>
            <div className="flex items-center justify-center gap-3">
              <p className="hidden text-center text-[2em] font-medium max-md:block">
                {data.event.isFree ? "FREE" : formatCurrency(primaryTicket?.price ?? data.event.ticketPrice)}
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white/90 px-4 py-2 text-sm font-semibold text-[#2c1d42] shadow-soft transition hover:bg-white"
                onClick={() => setShareOpen(true)}
              >
                <Share2 className="h-4 w-4" />
                Share event
              </button>
            </div>
          </div>
        </div>

        <hr className="my-[2em]" />
        <h2 className="text-[1.7rem] font-semibold tracking-[-0.03em] text-ink">About this event</h2>
        <div className="event-description mt-4 max-w-4xl text-sm leading-8 text-[#585365] sm:text-base" dangerouslySetInnerHTML={{ __html: descriptionMarkup }} />
      </section>

      <section className="mt-10">
        <h2 className="text-[1.7rem] font-semibold tracking-[-0.03em] text-ink">Gallery</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[1.6] rounded-[14px] border border-line bg-cover bg-center shadow-soft"
              style={{ backgroundImage: `url(${coverImage})` }}
            />
          ))}
        </div>
      </section>

      {data.event.ticketTiers.length ? (
        <section className="mt-10">
          <h2 className="text-[1.7rem] font-semibold tracking-[-0.03em] text-ink">Ticket options</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.event.ticketTiers
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((tier) => (
                <div key={tier.id} className="surface-panel p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-ink">{tier.name}</p>
                      <p className="mt-1 text-sm text-muted">{tier.quantity} spots available</p>
                    </div>
                    <Badge tone="default">{tier.price === 0 ? "Free" : formatCurrency(tier.price)}</Badge>
                  </div>
                  {tier.perks.length ? (
                    <ul className="mt-4 space-y-2 text-sm text-muted">
                      {tier.perks.map((perk) => (
                        <li key={perk} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#ff5a1f]" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
          </div>
        </section>
      ) : null}

      {data.event.guests.length ? (
        <section className="mt-10">
          <h2 className="text-[1.7rem] font-semibold tracking-[-0.03em] text-ink">Featured guests</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.event.guests.map((guest) => (
              <div key={guest.id} className="surface-panel p-5">
                <div className="flex items-center gap-4">
                  <div
                    className="h-16 w-16 rounded-[16px] bg-[#efeaf7] bg-cover bg-center"
                    style={{ backgroundImage: guest.imageUrl ? `url(${guest.imageUrl})` : undefined }}
                  />
                  <div>
                    <p className="text-lg font-semibold text-ink">{guest.name}</p>
                    <p className="text-sm text-muted">{guest.role}</p>
                  </div>
                </div>
                {guest.bio ? <p className="mt-4 text-sm leading-7 text-muted">{guest.bio}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8 flex flex-col gap-4 border-t border-[#ded9e8] pt-5 text-sm text-[#5f5a69] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {["A", "J", "D"].map((initial, index) => (
              <span
                key={initial}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[11px] font-semibold text-white"
                style={{ backgroundColor: ["#FF5A1F", "#D3A23A", "#5D2E8C"][index] }}
              >
                {initial}
              </span>
            ))}
          </div>
          <span>{data.event.attendeesCount}+ others going</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff5a1f] text-[11px] font-semibold text-white">I</span>
          <span>Organized by {data.event.organizerId?.name ?? "Janet Events"}</span>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="surface-panel p-6">
          <h3 className="font-display text-[1.6rem] font-semibold tracking-[-0.04em] text-ink">Guest wall</h3>
          <p className="mt-2 text-sm text-muted">Share a short note before the event or while the room is still buzzing.</p>
          <form
            className="mt-5 space-y-4"
            onSubmit={async (submitEvent) => {
              submitEvent.preventDefault();
              const created = await createEventPost.mutateAsync({
                eventId: data.event._id,
                payload: {
                  guestName,
                  content: message
                }
              });
              setMessages((current) => [created.data, ...current]);
              setGuestName("");
              setMessage("");
            }}
          >
            <Input placeholder="Your name" value={guestName} onChange={(event) => setGuestName(event.target.value)} />
            <Textarea placeholder="Share a short celebratory note" value={message} onChange={(event) => setMessage(event.target.value)} />
            <Button variant="pill" type="submit">
              Post message
            </Button>
          </form>
        </div>
        <div className="space-y-3">
          {messages.length ? (
            messages.map((item) => (
              <div key={item._id} className="surface-panel p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{item.userId?.name || item.guestName || "Guest"}</p>
                  <Badge tone="default">Message</Badge>
                </div>
                <p className="mt-2 text-sm leading-7 text-muted">{item.content}</p>
              </div>
            ))
          ) : (
            <EmptyState title="No wall posts yet" description="Be the first guest to leave a note for this event." />
          )}
        </div>
      </section>

      {shareOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#1c1328]/45 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-[460px] rounded-[24px] border border-line bg-white p-5 shadow-[0_24px_80px_rgba(32,14,43,0.24)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[1.2rem] font-semibold tracking-[-0.02em] text-ink">Share this event</p>
                <p className="mt-2 text-sm leading-6 text-muted">Send the canonical event link anywhere your audience already hangs out.</p>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface text-muted transition hover:text-ink"
                onClick={() => setShareOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {nativeShareAvailable ? (
              <Button
                variant="pill"
                className="mt-5 w-full bg-[#ff5a1f] hover:bg-[#e64d16]"
                onClick={async () => {
                  await navigator.share({
                    title: data.event.title,
                    text: shareText,
                    url: canonicalUrl
                  });
                }}
              >
                <Send className="h-4 w-4" />
                Use device share
              </Button>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {shareOptions.map((option) => (
                <a
                  key={option.label}
                  href={option.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-[16px] border border-line bg-surface-subtle px-4 py-3 text-sm font-semibold text-ink transition hover:border-[#ff5a1f]/40 hover:bg-[#fff7f3]"
                >
                  <span>{option.label}</span>
                  {option.label === "Facebook" ? (
                    <Users className="h-4 w-4 text-[#ff5a1f]" />
                  ) : option.label === "LinkedIn" ? (
                    <BriefcaseBusiness className="h-4 w-4 text-[#ff5a1f]" />
                  ) : option.label === "X" ? (
                    <Send className="h-4 w-4 text-[#ff5a1f]" />
                  ) : (
                    <MessageCircle className="h-4 w-4 text-[#ff5a1f]" />
                  )}
                </a>
              ))}
            </div>

            <div className="mt-5 rounded-[16px] border border-line bg-[#faf7fd] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Direct link</p>
              <div className="mt-2 flex items-center gap-2 rounded-[12px] bg-white px-3 py-3">
                <Link2 className="h-4 w-4 text-[#ff5a1f]" />
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{canonicalUrl}</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full bg-[#fff1eb] px-3 py-1.5 text-xs font-semibold text-[#ff5a1f]"
                  onClick={async () => {
                    await navigator.clipboard.writeText(canonicalUrl);
                    setCopyState("copied");
                    window.setTimeout(() => setCopyState("idle"), 1800);
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copyState === "copied" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
