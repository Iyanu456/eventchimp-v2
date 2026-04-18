"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, CalendarDays, Mail, Palette, Sparkles, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const linkColumns = [
  [
    { href: "/", label: "Home" },
    { href: "/events", label: "Explore events" },
    { href: "/dashboard/events/new", label: "Create event" }
  ],
  [
    { href: "/login", label: "Sign in" },
    { href: "/signup", label: "Create account" },
    { href: "/dashboard", label: "Organizer workspace" }
  ]
];

const footerFeatures = [
  { icon: Ticket, title: "Ticketing", text: "Clear purchase flow and calmer checkout." },
  { icon: CalendarDays, title: "Operations", text: "Manage events, guests, and revenue in one place." },
  { icon: Palette, title: "Branding", text: "Keep event pages and collateral visually aligned." }
];

export function Footer() {
  const pathname = usePathname();
  const isAppRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isAppRoute || isAuthRoute) {
    return null;
  }

  return (
    <footer className="mt-16">
      <div className="pixel-corners bg-[#37003f] px-4 py-16 text-white sm:px-6">
        <div className="page-shell">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                Start hosting
              </span>
              <h2 className="font-display mt-6 max-w-3xl text-[2.2rem] font-semibold tracking-[-0.06em] sm:text-[2.9rem]">
                Start Hosting your Events with EventChimp
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/72">
                Launch premium event pages, keep your operations organized, and give guests a product that feels trustworthy from the first click.
              </p>
            </div>
            <div className="rounded-[22px] border border-white/12 bg-white/8 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3 text-sm font-semibold text-white">
                <Mail className="h-4 w-4 text-[#d8a8ff]" />
                Ready to get started?
              </div>
              <p className="mt-3 text-sm leading-7 text-white/70">
                Create your account and start building your next event experience.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/signup">
                  <Button variant="pill" size="sm" className="min-w-[132px]">
                    Create account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full border-white/18 bg-white/8 text-white hover:bg-white/14 hover:text-white"
                  >
                    Sign in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#1f1f21] text-white">
        <div className="page-shell py-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div>
              <Logo tone="light" />
              <p className="mt-5 max-w-[420px] text-sm leading-8 text-white/66">
                Premium ticketing, organizer workflows, and brand-led event pages for launches, communities, conferences, and culture.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {footerFeatures.map((feature) => (
                  <div key={feature.title} className="rounded-[18px] border border-white/8 bg-white/5 p-4">
                    <feature.icon className="h-4 w-4 text-[#d8a8ff]" />
                    <p className="mt-3 text-sm font-semibold text-white">{feature.title}</p>
                    <p className="mt-2 text-xs leading-6 text-white/60">{feature.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-10 text-sm text-white/76">
              {linkColumns.map((column, index) => (
                <div key={index}>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                    {index === 0 ? "Navigate" : "Account"}
                  </p>
                  <div className="mt-4 space-y-4">
                    {column.map((item) => (
                      <Link key={item.label} href={item.href} className="flex items-center gap-2 transition hover:text-white">
                        <ArrowRight className="h-4 w-4 text-[#d8a8ff]" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 border-t border-white/8 pt-6 text-xs text-white/45">
            EventChimp. Designed for events that should feel worth showing up for.
          </div>
        </div>
      </div>
    </footer>
  );
}
