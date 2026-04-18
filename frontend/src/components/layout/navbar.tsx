"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, CalendarDays, Compass, Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/stores/session-store";

const links = [
  { href: "/events", label: "Explore", icon: Compass },
  { href: "/dashboard/events/new", label: "Create event", icon: CalendarDays }
];

export function Navbar() {
  const pathname = usePathname();
  const currentUser = useSessionStore((state) => state.currentUser);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAppRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isAppRoute || isAuthRoute) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-dashed border-[#d8d2e3] bg-white/92 backdrop-blur-md">
      <div className="page-shell">
        <div className="flex h-[74px] items-center justify-between gap-6">
          <Logo className="shrink-0" />
          <nav className="hidden items-center gap-3 rounded-full border border-[#ece8f3] bg-[#faf8fd] px-2 py-2 md:flex">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[#5e5968] transition hover:text-ink",
                    active && "bg-white text-ink shadow-soft"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f7f4fb] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6c4a96]">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              New season
            </span>
            {currentUser ? (
              <Link href={currentUser.role === "admin" ? "/admin" : "/dashboard"}>
                <Button variant="pill" size="sm">
                  Open workspace
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="rounded-full px-4 text-[#5e5968]">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="pill" size="sm" className="gap-2">
                    Start free
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-line text-[#6f697b] md:hidden"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
        {mobileOpen ? (
          <div className="space-y-2 border-t border-dashed border-[#d8d2e3] py-4 md:hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-[14px] bg-[#f3f2f6] px-4 py-3 text-sm font-medium text-ink"
                onClick={() => setMobileOpen(false)}
              >
                <link.icon className="h-4 w-4 text-accent" />
                {link.label}
              </Link>
            ))}
            {currentUser ? (
              <Link href={currentUser.role === "admin" ? "/admin" : "/dashboard"} onClick={() => setMobileOpen(false)}>
                <Button variant="pill" className="mt-2 w-full">
                  Open workspace
                </Button>
              </Link>
            ) : (
              <div className="mt-2 grid gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" className="w-full rounded-full">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)}>
                  <Button variant="pill" className="w-full">
                    Start free
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
