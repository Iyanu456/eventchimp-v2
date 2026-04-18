"use client";

import { create } from "zustand";
import { User } from "@/types/domain";

type SessionState = {
  currentUser: User | null;
  sessionExpired: boolean;
  globalMessage: string | null;
  setCurrentUser: (user: User | null) => void;
  setSessionExpired: (expired: boolean) => void;
  setGlobalMessage: (message: string | null) => void;
  logout: () => void;
};

const normalizeUser = (user: User | null): User | null => {
  if (!user) {
    return null;
  }

  if (user.role === "admin") {
    return user;
  }

  return {
    ...user,
    role: "organizer"
  };
};

export const useSessionStore = create<SessionState>((set) => ({
  currentUser: null,
  sessionExpired: false,
  globalMessage: null,
  setCurrentUser: (currentUser) => set({ currentUser: normalizeUser(currentUser) }),
  setSessionExpired: (sessionExpired) => set({ sessionExpired }),
  setGlobalMessage: (globalMessage) => set({ globalMessage }),
  logout: () =>
    set({
      currentUser: null,
      sessionExpired: false,
      globalMessage: null
    })
}));

export const sessionActions = {
  setCurrentUser: (user: User | null) => useSessionStore.getState().setCurrentUser(normalizeUser(user)),
  expireSession: () => useSessionStore.getState().setSessionExpired(true),
  clearSessionFlag: () => useSessionStore.getState().setSessionExpired(false),
  logout: () => useSessionStore.getState().logout()
};
