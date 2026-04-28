export const AUTH_ENDPOINTS = {
  register: "/auth/register",
  login: "/auth/login",
  me: "/auth/me",
  googleInitiate: "/auth/google/initiate",
  googleCallback: "/auth/google/callback"
};

export const EVENT_ENDPOINTS = {
  list: "/events",
  featured: "/events/featured",
  detailBySlug: (slug: string) => `/events/slug/${slug}`,
  byId: (id: string) => `/events/${id}`,
  posts: (eventId: string) => `/events/${eventId}/messages`,
  collaborators: (eventId: string) => `/events/${eventId}/collaborators`,
  inviteCollaborator: (eventId: string) => `/events/${eventId}/collaborators/invite`,
  acceptInvitation: (token: string) => `/events/invitations/${token}/accept`,
  metrics: (eventId: string) => `/events/${eventId}/metrics`,
  settings: (eventId: string) => `/events/${eventId}/settings`,
  scanTicket: (eventId: string) => `/events/${eventId}/tickets/scan`,
  checkInByToken: (eventId: string) => `/events/${eventId}/tickets/check-in`
};

export const TICKET_ENDPOINTS = {
  mine: "/tickets/me",
  guestList: (eventId: string) => `/tickets/event/${eventId}`,
  checkIn: (ticketId: string) => `/tickets/${ticketId}/check-in`
};

export const CHECKOUT_ENDPOINTS = {
  quote: "/checkout/quote",
  initialize: "/checkout/initialize",
  verify: "/checkout/verify"
};

export const PAYMENT_ENDPOINTS = {
  quote: "/payments/quote",
  checkout: "/payments/checkout",
  verify: (reference: string) => `/payments/verify/${reference}`
};

export const DASHBOARD_ENDPOINTS = {
  organizer: "/dashboard/organizer"
};

export const ORGANIZER_ENDPOINTS = {
  banks: "/organizer/banks",
  resolveAccount: "/organizer/resolve-account",
  payoutProfile: "/organizer/payout-profile",
  payoutStatus: "/organizer/payout-status",
  settings: "/organizer/settings"
};

export const BRANDING_ENDPOINTS = {
  templates: "/branding/templates"
};

export const REFUND_ENDPOINTS = {
  create: "/refunds"
};

export const ADMIN_ENDPOINTS = {
  overview: "/admin/overview",
  users: "/admin/users",
  events: "/admin/events",
  transactions: "/admin/transactions"
};
