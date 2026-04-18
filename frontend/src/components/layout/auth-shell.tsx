"use client";

import { Logo } from "@/components/ui/logo";

export function AuthShell({
  title,
  subtitle,
  promoTitle,
  children,
  footer
}: {
  title: string;
  subtitle: string;
  promoTitle: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white xl:grid xl:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-[364px]">
          <Logo />
          <div className="mt-16">
            <h1 className="font-display text-[2.5rem] font-semibold tracking-[-0.05em] text-ink">{title}</h1>
            <p className="mt-3 text-base text-[#b0aabb]">{subtitle}</p>
          </div>
          <div className="mt-10">{children}</div>
          {footer ? <div className="mt-8">{footer}</div> : null}
        </div>
      </div>
      <div className="auth-wave-panel hidden min-h-screen items-end xl:flex">
        <div className="px-16 pb-24 text-white">
          <div className="max-w-[470px] text-[4.5rem] font-medium leading-[0.92] tracking-[-0.08em]">
            {promoTitle}
          </div>
        </div>
      </div>
    </div>
  );
}
