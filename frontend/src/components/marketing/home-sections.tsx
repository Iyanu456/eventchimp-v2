"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Star,
  CalendarDays,
  Eye,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users2,
  WandSparkles
} from "lucide-react";
import { useFeaturedEventsQuery } from "@/hooks/queries/use-events-query";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingCard } from "@/components/ui/loading-card";
import { formatCurrency } from "@/lib/utils";

const ribbonItems = [
  "GET A TICKET",
  "ORGANIZE YOUR EVENT",
  "REGISTER NOW",
  "REACH YOUR TARGET"
];

const featureColumns = [
  {
    icon: Ticket,
    title: "Easy Ticketing",
    description: "Sell tickets with pricing and purchase flow that feels trustworthy at a glance.",
    points: ["Secure payments", "Access control", "Flexible pricing"]
  },
  {
    icon: Users2,
    title: "RSVP Management",
    description: "Keep your guest list under control without the usual dashboard clutter.",
    points: ["Automated reminders", "Guest list curation", "Event updates"]
  },
  {
    icon: Megaphone,
    title: "Promotion Tools",
    description: "Promote events with assets and messaging that stay aligned to your event brand.",
    points: ["Email campaigns", "Custom pricing", "Attendee insights"]
  }
];

const capabilityCards = [
  {
    icon: Sparkles,
    title: "A cleaner first impression",
    text: "Sharper landing sections, stronger hierarchy, and calmer calls to action."
  },
  {
    icon: ShieldCheck,
    title: "More trust at checkout",
    text: "Professional event cards and clearer pricing cues wherever guests are deciding."
  },
  {
    icon: WandSparkles,
    title: "Brand consistency",
    text: "Carry the same premium design language from marketing to organizer workflow."
  }
];

function RibbonBand() {
  return (
    <div className="ribbon-band py-6">
      <div className="page-shell flex flex-wrap items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white sm:text-xs">
        {ribbonItems.map((item) => (
          <div key={item} className="flex items-center gap-3">
            <span className="ribbon-eye">
              <Eye className="h-3.5 w-3.5" />
            </span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LatestEventCard({
  title,
  image,
  price
}: {
  title: string;
  image: string;
  price: string;
}) {
  return (
    <div className="group overflow-hidden rounded-[14px] bg-[#2c113d] text-white shadow-soft">
      
      {/* Image wrapper */}
      <div className="relative h-[210px] overflow-hidden">
        
        {/* Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url(${image})` }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a26]/5 to-[#1a0a26]/70" />
      </div>

      <div className="space-y-3 px-4 py-4">
        <h3 className="line-clamp-2 text-base font-semibold tracking-[0.01em]">
          {title}
        </h3>

        <div className="flex items-center justify-between text-sm text-white/70">
          <span>View event</span>
          <span className="font-semibold text-[#f0c6ff]">{price}</span>
        </div>
      </div>
    </div>
  );
}

export function HomeSections() {
  const { data, isLoading } = useFeaturedEventsQuery();
  const featuredEvents = data?.slice(0, 4) ?? [];

  return (
    <div className="bg-white">
      <section className="page-shell grid gap-10 py-12 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:py-16 lg:mb-[2em]">
        <div className="max-w-[560px] max-md:w-fit max-md:items max-md:mt-[1.5em]">
          <p className="w-fit flex gap-2 rounded-full bg-[#f6f2fc] px-4 py-2 text-sm font-semibold text-[#6d4e97] max-md:mx-auto">
            <Sparkles className="h-4 w-4 text-accent" />
            Get started with EventChimp
          </p>
          <h1 className="font-display mt-3 md:mt-6 text-[2.5rem] font-semibold leading-[1.25] max-md:mx-auto max-md:text-center md:leading-[0.93] tracking-[-0.07em] text-ink md:text-[3.85rem] lg:text-[5rem]">
            Events that people don&apos;t just attend,
            <br />
            they <span className="text-accent">Experience</span>
          </h1>
          <p className="mt-6 max-md:text-sm max-md:mx-auto max-md:text-center max-md:max-w-[80%] max-w-[520px] text-base leading-8 text-muted lg:text-[1.08rem]">
            Sell tickets, manage RSVP flow and present every event in a way that feels deliberate from the first glance.
          </p>
          <div className="mt-8 flex max-md:grid flex-wrap gap-3 max-md:w-full place-items-center">
            <Link href="/dashboard/events/new">
              <Button variant="pill" size="lg" className="max-md:w-[80vw] max-md:mx-auto">
                Create an Event
              </Button>
            </Link>
            <Link href="/events">
              <Button variant="secondary" size="lg" className="max-md:w-[80vw] rounded-full max-md:mx-auto">
                Explore Events
              </Button>
            </Link>
          </div>
          {/*<div className="mt-10 grid gap-3 sm:grid-cols-3">
            {capabilityCards.map((item) => (
              <div key={item.title} className="rounded-[18px] border border-[#ece8f3] bg-[#faf8fd] p-4">
                <item.icon className="h-4 w-4 text-accent" />
                <p className="mt-3 text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-2 text-xs leading-6 text-muted">{item.text}</p>
              </div>
            ))}
          </div>*/}
        </div>
        <div className="justify-self-center">
          <Image
            src="/Hero_section_mockup.png"
            alt="EventChimp mobile product preview"
            width={660}
            height={580}
            priority
            className="h-auto w-full max-w-[580px] md:scale-[1.4] hover:scale-[1.2] transition-transform duration-300 object-contain"
          />
        </div>
      </section>

      <RibbonBand />

      <section className="bg-[#fbfafc] py-16 lg:pt-[6em]">
        <div className="page-shell">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[2.2rem] font-semibold tracking-[-0.04em] text-ink">Latest Events</p>
              <p className="mt-1 text-base text-muted">Discover the best events happening near you</p>
            </div>
            <div className="flex h-11 w-full items-center rounded-full bg-white px-4 text-sm text-[#b0aabd] shadow-soft sm:max-w-[320px]">
              Search event name, venue, location or date
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => <LoadingCard key={index} className="h-[278px]" />)
              : featuredEvents.length
                ? featuredEvents.map((event) => (
                    <LatestEventCard
                      key={event._id}
                      title={event.title}
                      image={event.coverImage}
                      price={event.isFree ? "FREE" : formatCurrency(event.ticketPrice)}
                    />
                  ))
                : (
                  <div className="sm:col-span-2 xl:col-span-4">
                    <EmptyState
                      title="No live events yet"
                      description="Published events will appear here in the storefront layout from the references."
                    />
                  </div>
                )}
          </div>
          <div className="mt-[3.5em] flex justify-center">
            <Link href="/events">
              <Button variant="pill" size="lg">
                View all Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="page-shell py-16">
        <div className="mb-10 max-w-[760px]">
          <h2 className="font-display text-[2.15rem] font-semibold tracking-[-0.05em] text-ink sm:text-[2.6rem]">
            Everything you need to run the event beautifully
          </h2>
          <p className="mt-4 text-base leading-8 text-muted">
            Better public presentation, cleaner operations, and stronger promotional tooling all living inside the same product system.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {featureColumns.map((feature) => (
            <div key={feature.title} className="rounded-[22px] border border-[#ece8f3] bg-white p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#f6f1fc] text-accent">
                  <feature.icon className="h-5 w-5" />
                </span>
                <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">{feature.title}</h2>
                
              </div>
              
              <p className="mt-5 leading-7 text-gray-800">{feature.description}</p>
              
              <ul className="mt-5 space-y-2.5 leading-7 text-gray-800">
                {feature.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <Check className="my-auto mt-2 h-4 w-4 shrink-0 font-medium text-accent" />
                    <span className="my-auto">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <RibbonBand />

      <section className="page-shell py-16 pt-[6em] text-center">
        <div className="flex justify-center gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className=" text-accent" fill="currentColor" />
          ))}
        </div>
        <blockquote className="mx-auto mt-8 max-w-3xl text-[1.45rem] font-medium leading-10 tracking-[-0.03em] text-[#2d243d] sm:text-[1.8rem]">
          "EventChimp has transformed the way we manage events. Ticket sales are up and our guests love the seamless experience."
        </blockquote>
        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0eff4] text-sm font-semibold text-ink">
            WS
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-ink">Whitney Stone</p>
            <p className="text-xs text-muted">Event Organizer</p>
          </div>
        </div>
      </section>
    </div>
  );
}
