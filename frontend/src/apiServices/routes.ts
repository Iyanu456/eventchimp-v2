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
  posts: (eventId: string) => `/events/${eventId}/messages`
};

export const TICKET_ENDPOINTS = {
  mine: "/tickets/me",
  guestList: (eventId: string) => `/tickets/event/${eventId}`,
  checkIn: (ticketId: string) => `/tickets/${ticketId}/check-in`
};

export const CHECKOUT_ENDPOINTS = {
  initialize: "/checkout/initialize",
  verify: "/checkout/verify"
};

export const DASHBOARD_ENDPOINTS = {
  organizer: "/dashboard/organizer"
};

export const BRANDING_ENDPOINTS = {
  templates: "/branding/templates"
};

export const ADMIN_ENDPOINTS = {
  overview: "/admin/overview",
  users: "/admin/users",
  events: "/admin/events",
  transactions: "/admin/transactions"
};
