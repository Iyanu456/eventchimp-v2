import {
  ADMIN_ENDPOINTS,
  AUTH_ENDPOINTS,
  BRANDING_ENDPOINTS,
  CHECKOUT_ENDPOINTS,
  DASHBOARD_ENDPOINTS,
  EVENT_ENDPOINTS,
  TICKET_ENDPOINTS
} from "./routes";
import { crudRequest } from "./crud-requests";
import { ApiEnvelope } from "@/types/api";
import {
  AdminOverview,
  AuthResponse,
  BrandingAssetType,
  BrandingTemplate,
  Event,
  EventDetailResponse,
  EventMessage,
  EventsResponse,
  OrganizerDashboard,
  Ticket,
  Transaction,
  User
} from "@/types/domain";

const buildSearchParams = (params?: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
};

const buildEventFormData = (payload: {
  title: string;
  category: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  ticketPrice: number;
  isFree: boolean;
  status: string;
  tags: string[];
  coverImage?: File | null;
}) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "coverImage") {
      if (value instanceof File) {
        formData.append(key, value);
      }
      return;
    }

    if (key === "tags") {
      formData.append("tags", JSON.stringify(value));
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};

export const request = {
  register: async (payload: {
    name: string;
    email: string;
    password: string;
    role: "attendee" | "organizer" | "admin";
  }) =>
    crudRequest.post<ApiEnvelope<AuthResponse>, typeof payload>(AUTH_ENDPOINTS.register, payload),

  login: async (payload: { email: string; password: string }) =>
    crudRequest.post<ApiEnvelope<AuthResponse>, typeof payload>(AUTH_ENDPOINTS.login, payload),

  googleInitiate: async () =>
    crudRequest.get<ApiEnvelope<{ authUrl: string }>>(AUTH_ENDPOINTS.googleInitiate),

  googleCallback: async (payload: { code: string }) =>
    crudRequest.post<ApiEnvelope<AuthResponse>, typeof payload>(AUTH_ENDPOINTS.googleCallback, payload),

  getOwnProfile: async () => crudRequest.get<ApiEnvelope<User>>(AUTH_ENDPOINTS.me),

  getEvents: async (params?: Record<string, string | number | undefined>) =>
    crudRequest.get<ApiEnvelope<EventsResponse>>(`${EVENT_ENDPOINTS.list}${buildSearchParams(params)}`),

  getFeaturedEvents: async () =>
    crudRequest.get<ApiEnvelope<Event[]>>(EVENT_ENDPOINTS.featured),

  getEventBySlug: async (slug: string) =>
    crudRequest.get<ApiEnvelope<EventDetailResponse>>(EVENT_ENDPOINTS.detailBySlug(slug)),

  createEvent: async (payload: {
    title: string;
    category: string;
    description: string;
    location: string;
    startDate: string;
    endDate: string;
    capacity: number;
    ticketPrice: number;
    isFree: boolean;
    status: string;
    tags: string[];
    coverImage?: File | null;
  }) =>
    crudRequest.post<ApiEnvelope<Event>, FormData>(EVENT_ENDPOINTS.list, buildEventFormData(payload), {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }),

  updateEvent: async (
    id: string,
    payload: {
      title: string;
      category: string;
      description: string;
      location: string;
      startDate: string;
      endDate: string;
      capacity: number;
      ticketPrice: number;
      isFree: boolean;
      status: string;
      tags: string[];
      coverImage?: File | null;
    }
  ) =>
    crudRequest.patch<ApiEnvelope<Event>, FormData>(
      EVENT_ENDPOINTS.byId(id),
      buildEventFormData(payload),
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    ),

  deleteEvent: async (id: string) =>
    crudRequest.delete<ApiEnvelope<null>>(EVENT_ENDPOINTS.byId(id)),

  getEventPosts: async (eventId: string) =>
    crudRequest.get<ApiEnvelope<EventMessage[]>>(EVENT_ENDPOINTS.posts(eventId)),

  createEventPost: async (eventId: string, payload: { guestName?: string; content: string }) =>
    crudRequest.post<ApiEnvelope<EventMessage>, typeof payload>(EVENT_ENDPOINTS.posts(eventId), payload),

  initializeCheckout: async (payload: { eventId: string }) =>
    crudRequest.post<
      ApiEnvelope<{
        reference: string;
        checkoutUrl: string;
        mode: "live" | "mock";
        pricing: {
          ticketPrice: number;
          serviceFee: number;
          totalPaid: number;
          organizerShare: number;
          platformRevenue: number;
        };
      }>,
      typeof payload
    >(CHECKOUT_ENDPOINTS.initialize, payload),

  verifyCheckout: async (payload: { reference: string }) =>
    crudRequest.post<ApiEnvelope<{ transaction: Transaction; ticket: Ticket }>, typeof payload>(
      CHECKOUT_ENDPOINTS.verify,
      payload
    ),

  getOrganizerDashboard: async () =>
    crudRequest.get<ApiEnvelope<OrganizerDashboard>>(DASHBOARD_ENDPOINTS.organizer),

  getBrandingTemplates: async (eventId?: string) =>
    crudRequest.get<ApiEnvelope<BrandingTemplate[]>>(
      `${BRANDING_ENDPOINTS.templates}${buildSearchParams({ eventId })}`
    ),

  generateBrandingAssetMetadata: async (payload: {
    eventId: string;
    type: BrandingAssetType;
    eventName: string;
    date: string;
    venue: string;
    organizerName: string;
    sponsorName?: string;
    logo?: string;
    accentColor?: string;
  }) =>
    crudRequest.post<ApiEnvelope<BrandingTemplate["assets"][number]>, typeof payload>(
      BRANDING_ENDPOINTS.templates,
      payload
    ),

  getMyTickets: async () =>
    crudRequest.get<ApiEnvelope<Ticket[]>>(TICKET_ENDPOINTS.mine),

  getEventTickets: async (eventId: string) =>
    crudRequest.get<ApiEnvelope<Ticket[]>>(TICKET_ENDPOINTS.guestList(eventId)),

  checkInTicket: async (ticketId: string) =>
    crudRequest.patch<ApiEnvelope<Ticket>, undefined>(TICKET_ENDPOINTS.checkIn(ticketId)),

  getAdminOverview: async () =>
    crudRequest.get<ApiEnvelope<AdminOverview>>(ADMIN_ENDPOINTS.overview),

  getAdminUsers: async () =>
    crudRequest.get<ApiEnvelope<User[]>>(ADMIN_ENDPOINTS.users),

  getAdminEvents: async () =>
    crudRequest.get<ApiEnvelope<Event[]>>(ADMIN_ENDPOINTS.events),

  getAdminTransactions: async () =>
    crudRequest.get<ApiEnvelope<Transaction[]>>(ADMIN_ENDPOINTS.transactions)
};
