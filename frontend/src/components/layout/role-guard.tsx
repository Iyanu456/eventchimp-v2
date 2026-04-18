"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/stores/session-store";
import { UserRole } from "@/types/domain";

export function RoleGuard({
  roles,
  children
}: {
  roles: UserRole[];
  children: ReactNode;
}) {
  const currentUser = useSessionStore((state) => state.currentUser);

  if (!currentUser) {
    return (
      <div className="page-shell py-16">
        <div className="surface-panel mx-auto max-w-3xl px-8 py-12 text-center">
          <p className="utility-label">Protected workspace</p>
          <h1 className="font-display mt-4 text-[2.6rem] font-semibold tracking-[-0.05em] text-ink">
            Sign in to continue
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted md:text-base">
            This area is connected to protected backend routes. Sign in to open your EventChimp workspace.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/login">
              <Button variant="pill">Go to login</Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary">Create account</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!roles.includes(currentUser.role)) {
    return (
      <div className="page-shell py-16">
        <div className="surface-panel mx-auto max-w-3xl px-8 py-12 text-center">
          <p className="utility-label">Access control</p>
          <h1 className="font-display mt-4 text-[2.6rem] font-semibold tracking-[-0.05em] text-ink">
            Restricted area
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted md:text-base">
            Your current role is <strong>{currentUser.role}</strong>. This page is available to {roles.join(", ")} accounts.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
