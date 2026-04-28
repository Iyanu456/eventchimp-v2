"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Palette,
  Search,
  Ticket,
  X,
  Users,
  UserCircle,
  type LucideIcon
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSessionStore } from "@/stores/session-store";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { useAppMutations } from "@/hooks/mutations/use-app-mutations";

type DashboardLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

const organizerLinks: DashboardLink[] = [
  { href: "/dashboard/settings", label: "Account", icon: UserCircle },
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, badge: "3" },
  { href: "/dashboard/tickets", label: "Tickets", icon: Ticket },
  { href: "/dashboard/transactions", label: "Transactions", icon: CreditCard },
  { href: "/dashboard/payouts", label: "Payouts", icon: CircleDollarSign },
  { href: "/dashboard/branding", label: "Branding Kit", icon: Palette }
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

function ProfileSummary({
  displayName,
  displayEmail,
  onLogout
}: {
  displayName: string;
  displayEmail: string;
  onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative rounded-[18px] border border-line bg-[#faf8fd] p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ffcae4_0%,#e6aaff_100%)] text-xs font-semibold text-ink">
          {displayName
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{displayName}</p>
          <p className="truncate text-xs text-muted">{displayEmail}</p>
        </div>
        <button
          type="button"
          className="ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#7f778d] shadow-soft transition hover:text-accent"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="Open account actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      {menuOpen ? (
        <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 rounded-[16px] border border-line bg-white p-2 shadow-[0_18px_42px_rgba(39,20,63,0.16)]">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-semibold text-[#6e6a76] transition hover:bg-[#f3eff8] hover:text-ink"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 text-accent" />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function QuickSearch({
  links,
  onNavigate,
  className
}: {
  links: DashboardLink[];
  onNavigate?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const items = useMemo(
    () =>
      links.map((link) => ({
        ...link,
        keywords: `${link.label} ${link.href.replaceAll("/", " ")} ${
          link.label === "Account" ? "settings profile bank payout setup" : ""
        } ${link.label === "Events" ? "create manage publish paid tickets" : ""} ${
          link.label === "Payouts" ? "settlement processing revenue withdrawals" : ""
        } ${link.label === "Branding Kit" ? "assets templates design" : ""}`.toLowerCase()
      })),
    [links]
  );
  const matches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return items.slice(0, 5);
    }

    return items.filter((item) => item.keywords.includes(normalizedQuery)).slice(0, 6);
  }, [items, query]);
  const showResults = focused || query.trim().length > 0;

  const openItem = (href: string) => {
    router.push(href);
    setQuery("");
    setFocused(false);
    onNavigate?.();
  };

  return (
    <div className={cn("relative w-full max-w-[320px]", className)}>
      <div className="flex h-12 items-center gap-3 rounded-[14px] bg-[#f3f2f6] px-4 text-sm text-[#7f778d] ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-accent/25">
        <Search className="h-4 w-4 shrink-0 text-accent" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && matches[0]) {
              event.preventDefault();
              openItem(matches[0].href);
            }
          }}
          placeholder="Search tools, tabs, actions..."
          className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-[#aaa4b3]"
        />
      </div>

      {showResults ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[18px] border border-line bg-white p-2 shadow-[0_22px_60px_rgba(39,20,63,0.16)]">
          {matches.length ? (
            matches.map((item) => (
              <button
                key={item.href}
                type="button"
                className="flex w-full items-center gap-3 rounded-[12px] px-3 py-3 text-left transition hover:bg-[#f6f3fa]"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => openItem(item.href)}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-accent/10 text-accent">
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{item.label}</span>
                  <span className="block truncate text-xs text-muted">{item.href}</span>
                </span>
              </button>
            ))
          ) : (
            <div className="px-3 py-5 text-center text-sm text-muted">No matching dashboard tools</div>
          )}
        </div>
      ) : null}
    </div>
  );
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
  const router = useRouter();
  const currentUser = useSessionStore((state) => state.currentUser);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAppMutations();
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

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] lg:pl-[240px]">
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
            <QuickSearch links={links} onNavigate={() => setMobileOpen(false)} className="max-w-none" />
          </div>
          <nav className="mt-6 min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-4">
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
          <div className="px-4 pb-5">
            <ProfileSummary displayName={displayName} displayEmail={displayEmail} onLogout={handleLogout} />
          </div>
          {/*<div className="mt-auto p-4 pb-5">
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
          </div>*/}
        </aside>
      </div>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-[#ece8f3] bg-white lg:flex">
        <div className="px-8 pt-10">
          <Logo/>
        </div>
        <nav className="mt-10 min-h-0 flex-1 space-y-2 overflow-y-auto px-6 pb-6">
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
        <div className="px-5 pb-5">
          <ProfileSummary displayName={displayName} displayEmail={displayEmail} onLogout={handleLogout} />
        </div>
        {/*<div className="mt-auto px-6 pb-6">
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
        </div>*/}
      </aside>

      <div className="flex h-screen min-w-0 flex-col overflow-hidden">
        <div className="relative z-30 shrink-0 border-b border-[#ece8f3] bg-white/95 backdrop-blur-xl">
          <div className="flex h-[88px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-[96px] lg:px-8">
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
            <QuickSearch links={links} className="ml-auto hidden md:block" />
          </div>
        </div>
        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {showHeading && title ? (
            <div className="mb-6">
              <h1 className="font-display text-[2.2rem] font-semibold tracking-[-0.05em] text-ink">{title}</h1>
              {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">{subtitle}</p> : null}
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
