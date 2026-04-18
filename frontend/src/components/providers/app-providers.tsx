"use client";

import { ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { AuthBootstrap } from "./auth-bootstrap";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthBootstrap>{children}</AuthBootstrap>
    </QueryProvider>
  );
}
