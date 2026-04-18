"use client";

import { ReactNode, useEffect } from "react";
import { useOwnProfileQuery } from "@/hooks/queries/use-own-profile-query";
import { sessionActions, useSessionStore } from "@/stores/session-store";

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const sessionExpired = useSessionStore((state) => state.sessionExpired);
  const { data } = useOwnProfileQuery();

  useEffect(() => {
    if (data) {
      sessionActions.setCurrentUser(data);
    }
  }, [data]);

  useEffect(() => {
    if (sessionExpired) {
      sessionActions.clearSessionFlag();
    }
  }, [sessionExpired]);

  return children;
}
