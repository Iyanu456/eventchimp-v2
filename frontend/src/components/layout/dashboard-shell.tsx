"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  Menu,
  Palette,
  Search,
  Settings,
  Ticket,
  Wallet,
  X,
  Users,
  ArrowRight,
  CircleDollarSign,
  type LucideIcon
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSessionStore } from "@/stores/session-store";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

type DashboardLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

const organizerLinks: DashboardLink[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, badge: "3" },
  { href: "/dashboard/tickets", label: "Tickets", icon: Ticket },
  { href: "/dashboard/transactions", label: "Transactions", icon: CreditCard },
  { href: "/dashboard/payouts", label: "Payouts", icon: CircleDollarSign },
  { href: "/dashboard/branding", label: "Branding Kit", icon: Palette },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

const adminLinks: DashboardLink[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/transactions", label: "Transactions", icon: CreditCard }
];

function isLinkActive(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && href !== "/admin" && pathname.startsWith(href));
}

export function DashboardShell({
  children,
  title,
  subtitle,
  showHeading = true
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showHeading?: boolean;
}) {
  const pathname = usePathname();
  const currentUser = useSessionStore((state) => state.currentUser);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = pathname.startsWith("/admin");
  const links = useMemo(() => (isAdmin ? adminLinks : organizerLinks), [isAdmin]);
  const displayName = currentUser?.name ?? "Whitney Stone";
  const displayEmail = currentUser?.email ?? "whitneystone@gmail.com";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-[#f4f4f4] lg:grid lg:grid-cols-[236px_minmax(0,1fr)]">
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-[#12091f]/45 transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[288px] max-w-[calc(100vw-2rem)] flex-col border-r border-[#ece8f3] bg-white shadow-[0_28px_70px_rgba(31,18,52,0.22)] transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between px-5 pb-4 pt-6">
            <Logo />
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-line text-[#6e6a76]"
              onClick={() => setMobileOpen(false)}
              aria-label="Close workspace navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="px-5">
            <div className="flex h-12 items-center gap-3 rounded-[14px] bg-[#f3f2f6] px-4 text-sm text-[#b2abba]">
              <Search className="h-4 w-4 text-accent" />
              <span>Search anything...</span>
            </div>
          </div>
          <nav className="mt-6 space-y-2 px-4">
            {links.map((link) => {
              const active = isLinkActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn("app-sidebar-link justify-between", active && "app-sidebar-link-active")}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="flex items-center gap-3">
                    <link.icon className="h-4 w-4 shrink-0" />
                    <span>{link.label}</span>
                  </span>
                  {link.badge ? (
                    <span className={cn("text-xs", active ? "text-white/85" : "text-[#8d8798]")}>{link.badge}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto p-4 pb-5">
            <div className="dashboard-wave-card rounded-[18px] p-5 text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12">
                <Wallet className="h-5 w-5" />
              </div>
              <p className="mt-6 max-w-[170px] text-[1.05rem] font-medium leading-7">
                Get all the help you'll need running your {isAdmin ? "product" : "event"}
              </p>
              <button className="mt-7 inline-flex h-11 w-14 items-center justify-center rounded-full border border-white/35 text-white">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>
      </div>

      <aside className="hidden min-h-screen flex-col border-r border-[#ece8f3] bg-white lg:flex">
        <div className="px-8 pt-10">
          <Logo />
        </div>
        <nav className="mt-10 space-y-2 px-6">
          {links.map((link) => {
            const active = isLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn("app-sidebar-link justify-between", active && "app-sidebar-link-active")}
              >
                <span className="flex items-center gap-3">
                  <link.icon className="h-4 w-4 shrink-0" />
                  <span>{link.label}</span>
                </span>
                {link.badge ? (
                  <span className={cn("text-xs", active ? "text-white/85" : "text-[#8d8798]")}>{link.badge}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-6 pb-6">
          <div className="dashboard-wave-card rounded-[18px] p-5 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12">
              <Wallet className="h-5 w-5" />
            </div>
            <p className="mt-6 max-w-[160px] text-[1.15rem] font-medium leading-7">
              Get all the help you'll need running your {isAdmin ? "product" : "event"}
            </p>
            <button className="mt-7 inline-flex h-11 w-14 items-center justify-center rounded-full border border-white/35 text-white">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="border-b border-[#ece8f3] bg-white">
          <div className="flex h-[96px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-line text-[#6e6a76]"
                onClick={() => setMobileOpen((value) => !value)}
                aria-label="Toggle workspace navigation"
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
              <Logo />
            </div>
            <div className="hidden h-12 w-full max-w-[250px] items-center gap-3 rounded-[14px] bg-[#f3f2f6] px-4 text-sm text-[#b2abba] md:flex">
              <Search className="h-4 w-4 text-accent" />
              <span>Search anything...</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-base font-semibold text-ink">{displayName}</p>
                <p className="text-sm text-muted">{displayEmail}</p>
              </div>
              <div className="flex h-[56px] items-center gap-3 rounded-full border border-[#ece8f3] bg-white px-3 shadow-soft">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ffcae4_0%,#e6aaff_100%)] text-xs font-semibold text-ink">
                  {displayName
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <ChevronDown className="h-4 w-4 text-[#7f798d]" />
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {showHeading && title ? (
            <div className="mb-6">
              <h1 className="font-display text-[2.2rem] font-semibold tracking-[-0.05em] text-ink">{title}</h1>
              {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">{subtitle}</p> : null}
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}
