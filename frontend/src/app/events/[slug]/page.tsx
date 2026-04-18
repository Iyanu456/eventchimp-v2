"use client";

import { useState } from "react";
import { CalendarDays, MapPin, Ticket, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useEventQuery } from "@/hooks/queries/use-events-query";
import { useAppMutations } from "@/hooks/mutations/use-app-mutations";
import { formatCurrency, formatEventDate } from "@/lib/utils";

export default function EventDetailPage({ params }: { params: { slug: string } }) {
  const { data, isLoading } = useEventQuery(params.slug);
  const { initializeCheckout, verifyCheckout, createEventPost } = useAppMutations();
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");

  if (isLoading || !data) {
    return <div className="page-shell py-24 text-sm text-muted">Loading event...</div>;
  }

  const { event, messages } = data;

  return (
    <div className="page-shell py-10">
      <section className="dashboard-wave-card rounded-[24px] px-5 py-6 text-white sm:px-7 sm:py-7 lg:px-9">
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
          <div className="rounded-[18px] shadow-soft">
            <div
              className="aspect-[0.86] rounded-[14px] bg-cover bg-center"
              style={{ backgroundImage: `url(${event.coverImage})` }}
            />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="md:flex justify-between">
          <div>
            <h1 className="font-display text-[2.1rem] font-semibold uppercase tracking-[-0.04em] leading-[1.3em] md:leading-[1.2em] sm:text-[2.55rem] md:max-w-[70%]">
              {event.title}
            </h1>
            <div className="flex gap-3 max-md:mt-3.5 mt-2.5">
               <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>{formatEventDate(event.startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            </div>
           
          </div>
          <div className="space-y-3 max-md:mt-[2em]">
            <Button 
              variant="pill" 
              size="lg" 
              className="px-[4em] max-md:w-full flex gap-4"
              onClick={async () => {
                  const initialized = await initializeCheckout.mutateAsync({ eventId: event._id });
                  if (initialized.data.mode === "live") {
                    window.location.href = initialized.data.checkoutUrl;
                    return;
                  }

                  await verifyCheckout.mutateAsync({ reference: initialized.data.reference });
                }}
              >Get Ticket <span className="max-md:block hidden">-</span> <span className="max-md:block hidden"> {event.isFree ? "FREE" : formatCurrency(event.ticketPrice)}</span> </Button>
            <p className="max-md:hidden block text-center font-medium text-[2em]">{event.isFree ? "FREE" : formatCurrency(event.ticketPrice)}</p>
          </div>
            
          
        </div>
        
            <hr className="my-[2em]"></hr>
        <h2 className="text-[1.7rem] font-semibold tracking-[-0.03em] text-ink">About this event</h2>
        <p className="mt-4 max-w-4xl text-sm leading-8 text-[#585365] sm:text-base">{event.description}</p>
      </section>

      

      <section className="mt-10">
        <h2 className="text-[1.7rem] font-semibold tracking-[-0.03em] text-ink">Gallery</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[1.15] rounded-[14px] border border-line bg-cover bg-center shadow-soft"
              style={{ backgroundImage: `url(${event.coverImage})` }}
            />
          ))}
        </div>
      </section>

      <section className="mt-8 flex flex-col gap-4 border-t border-[#ded9e8] pt-5 text-sm text-[#5f5a69] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {["A", "J", "D"].map((initial, index) => (
              <span
                key={initial}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[11px] font-semibold text-white"
                style={{ backgroundColor: ["#8828D2", "#B5C63B", "#F04B4B"][index] }}
              >
                {initial}
              </span>
            ))}
          </div>
          <span>{event.attendeesCount}+ others going</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">
            I
          </span>
          <span>Organized by {event.organizerId?.name ?? "Janet Events"}</span>
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
              await createEventPost.mutateAsync({
                eventId: event._id,
                payload: {
                  guestName,
                  content: message
                }
              });
              setGuestName("");
              setMessage("");
            }}
          >
            <Input placeholder="Your name" value={guestName} onChange={(event) => setGuestName(event.target.value)} />
            <Textarea
              placeholder="Share a short celebratory note"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
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
    </div>
  );
}
