export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const
  },
  events: {
    list: (params?: Record<string, string | number | undefined>) => ["events", params] as const,
    featured: ["events", "featured"] as const,
    detail: (slug: string) => ["events", slug] as const,
    posts: (eventId: string) => ["events", eventId, "posts"] as const,
    collaborators: (eventId: string) => ["events", eventId, "collaborators"] as const,
    metrics: (eventId: string) => ["events", eventId, "metrics"] as const
  },
  dashboard: {
    organizer: ["dashboard", "organizer"] as const,
    branding: ["dashboard", "branding"] as const
  },
  organizer: {
    payoutStatus: ["organizer", "payout-status"] as const,
    banks: ["organizer", "banks"] as const,
    settings: ["organizer", "settings"] as const,
    resolveAccount: (bankCode: string, accountNumber: string) =>
      ["organizer", "resolve-account", bankCode, accountNumber] as const
  },
  tickets: {
    mine: ["tickets", "mine"] as const,
    event: (eventId: string) => ["tickets", eventId] as const
  },
  admin: {
    overview: ["admin", "overview"] as const,
    users: ["admin", "users"] as const,
    events: ["admin", "events"] as const,
    transactions: ["admin", "transactions"] as const
  }
};
