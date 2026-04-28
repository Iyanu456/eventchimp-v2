import {
  ADMIN_ENDPOINTS,
  AUTH_ENDPOINTS,
  BRANDING_ENDPOINTS,
  CHECKOUT_ENDPOINTS,
  DASHBOARD_ENDPOINTS,
  EVENT_ENDPOINTS,
  ORGANIZER_ENDPOINTS,
  PAYMENT_ENDPOINTS,
  REFUND_ENDPOINTS,
  TICKET_ENDPOINTS
} from "./routes";
import { crudRequest } from "./crud-requests";
import { ApiEnvelope } from "@/types/api";
import {
  AdminOverview,
  AuthResponse,
  BrandingAssetType,
  BrandingTemplate,
  CheckoutAnswer,
  Event,
  EventCustomField,
  EventCollaboratorResponse,
  EventDetailResponse,
  EventGuest,
  EventMetrics,
  EventMessage,
  EventRecurrence,
  EventsResponse,
  EventStreaming,
  OrganizerDashboard,
  PayoutBank,
  PayoutStatus,
  PricingBreakdown,
  RefundRecord,
  Ticket,
  TicketTier,
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

export type EventPayload = {
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
  scheduleType: "single" | "recurring";
  recurrence?: EventRecurrence | null;
  attendanceMode: "in_person" | "virtual" | "hybrid";
  streaming?: EventStreaming | null;
  ticketTiers: TicketTier[];
  guests: EventGuest[];
  customFields: EventCustomField[];
  coverImage?: File | null;
};

const buildEventFormData = (payload: EventPayload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "coverImage") {
      if (value instanceof File) {
        formData.append(key, value);
      }
      return;
    }

    if (["tags", "recurrence", "streaming", "ticketTiers", "guests", "customFields"].includes(key)) {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};

export type InitializeCheckoutPayload = {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  attendeeFirstName: string;
  attendeeLastName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  comment?: string;
  customAnswers: CheckoutAnswer[];
};

export type PaymentQuotePayload = Pick<InitializeCheckoutPayload, "eventId" | "ticketTypeId" | "quantity">;

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

  getFeaturedEvents: async () => crudRequest.get<ApiEnvelope<Event[]>>(EVENT_ENDPOINTS.featured),

  getEventBySlug: async (slug: string) =>
    crudRequest.get<ApiEnvelope<EventDetailResponse>>(EVENT_ENDPOINTS.detailBySlug(slug)),

  createEvent: async (payload: EventPayload) =>
    crudRequest.post<ApiEnvelope<Event>, FormData>(EVENT_ENDPOINTS.list, buildEventFormData(payload), {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }),

  updateEvent: async (id: string, payload: EventPayload) =>
    crudRequest.patch<ApiEnvelope<Event>, FormData>(EVENT_ENDPOINTS.byId(id), buildEventFormData(payload), {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }),

  deleteEvent: async (id: string) => crudRequest.delete<ApiEnvelope<null>>(EVENT_ENDPOINTS.byId(id)),

  getEventPosts: async (eventId: string) =>
    crudRequest.get<ApiEnvelope<EventMessage[]>>(EVENT_ENDPOINTS.posts(eventId)),

  createEventPost: async (eventId: string, payload: { guestName?: string; content: string }) =>
    crudRequest.post<ApiEnvelope<EventMessage>, typeof payload>(EVENT_ENDPOINTS.posts(eventId), payload),

  getEventCollaborators: async (eventId: string) =>
    crudRequest.get<ApiEnvelope<EventCollaboratorResponse>>(EVENT_ENDPOINTS.collaborators(eventId)),

  inviteEventCollaborator: async (
    eventId: string,
    payload: { email: string; role: "manager" | "scanner" | "viewer" }
  ) => crudRequest.post<ApiEnvelope<EventCollaboratorResponse["invitations"][number]>, typeof payload>(EVENT_ENDPOINTS.inviteCollaborator(eventId), payload),

  acceptEventInvitation: async (token: string) =>
    crudRequest.post<ApiEnvelope<{ eventId: string; eventTitle: string; role: string }>, undefined>(
      EVENT_ENDPOINTS.acceptInvitation(token)
    ),

  getEventMetrics: async (eventId: string) =>
    crudRequest.get<ApiEnvelope<EventMetrics>>(EVENT_ENDPOINTS.metrics(eventId)),

  updateEventSettings: async (
    eventId: string,
    payload: { accessStatus?: "active" | "suspended"; suspensionReason?: string }
  ) => crudRequest.patch<ApiEnvelope<Event>, typeof payload>(EVENT_ENDPOINTS.settings(eventId), payload),

  scanEventTicket: async (eventId: string, payload: { qrToken: string }) =>
    crudRequest.post<
      ApiEnvelope<{
        status: "valid" | "used" | "invalid";
        ticket: {
          id: string;
          ticketCode: string;
          ticketTypeName: string;
          attendeeName: string;
          attendeeEmail: string;
          checkedInAt?: string | null;
          orderReference: string;
        } | null;
      }>,
      typeof payload
    >(EVENT_ENDPOINTS.scanTicket(eventId), payload),

  checkInEventTicket: async (eventId: string, payload: { qrToken: string }) =>
    crudRequest.post<ApiEnvelope<Ticket>, typeof payload>(EVENT_ENDPOINTS.checkInByToken(eventId), payload),

  getPaymentQuote: async (payload: PaymentQuotePayload) =>
    crudRequest.post<
      ApiEnvelope<PricingBreakdown>,
      typeof payload
    >(PAYMENT_ENDPOINTS.quote, payload),

  initializeCheckout: async (payload: InitializeCheckoutPayload) =>
    crudRequest.post<
      ApiEnvelope<{
        reference: string;
        checkoutUrl: string;
        mode: "live" | "mock";
        pricing: PricingBreakdown;
        ticketType: {
          id: string;
          name: string;
          quantity: number;
        };
      }>,
      typeof payload
    >(PAYMENT_ENDPOINTS.checkout, payload),

  verifyCheckout: async (payload: { reference: string }) =>
    crudRequest.get<ApiEnvelope<{ transaction: Transaction; order: Transaction; tickets: Ticket[] }>>(
      PAYMENT_ENDPOINTS.verify(payload.reference)
    ),

  getOrganizerDashboard: async () =>
    crudRequest.get<ApiEnvelope<OrganizerDashboard>>(DASHBOARD_ENDPOINTS.organizer),

  getPayoutBanks: async () => crudRequest.get<ApiEnvelope<PayoutBank[]>>(ORGANIZER_ENDPOINTS.banks),

  getPayoutStatus: async () => crudRequest.get<ApiEnvelope<PayoutStatus>>(ORGANIZER_ENDPOINTS.payoutStatus),

  resolvePayoutAccount: async (payload: {
    bankCode: string;
    accountNumber: string;
  }) =>
    crudRequest.post<
      ApiEnvelope<{
        accountName: string;
        accountNumber: string;
        bankCode: string;
      }>,
      typeof payload
    >(ORGANIZER_ENDPOINTS.resolveAccount, payload),

  upsertPayoutProfile: async (payload: {
    bankCode: string;
    accountNumber: string;
  }) =>
    crudRequest.post<ApiEnvelope<PayoutStatus>, typeof payload>(ORGANIZER_ENDPOINTS.payoutProfile, payload),

  updateOrganizerSettings: async (payload: {
    organizerNotifications: {
      ticketPurchaseEmail: boolean;
    };
  }) => crudRequest.patch<ApiEnvelope<PayoutStatus>, typeof payload>(ORGANIZER_ENDPOINTS.settings, payload),

  createRefund: async (payload: {
    orderReference: string;
    amount?: number;
    reason?: string;
    customerNote?: string;
    merchantNote?: string;
    includeServiceFee?: boolean;
  }) => crudRequest.post<ApiEnvelope<RefundRecord>, typeof payload>(REFUND_ENDPOINTS.create, payload),

  getBrandingTemplates: async (eventId?: string) =>
    crudRequest.get<ApiEnvelope<BrandingTemplate[]>>(`${BRANDING_ENDPOINTS.templates}${buildSearchParams({ eventId })}`),

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
    crudRequest.post<ApiEnvelope<BrandingTemplate["assets"][number]>, typeof payload>(BRANDING_ENDPOINTS.templates, payload),

  getMyTickets: async () => crudRequest.get<ApiEnvelope<Ticket[]>>(TICKET_ENDPOINTS.mine),

  getEventTickets: async (eventId: string) =>
    crudRequest.get<ApiEnvelope<Ticket[]>>(TICKET_ENDPOINTS.guestList(eventId)),

  checkInTicket: async (ticketId: string) =>
    crudRequest.patch<ApiEnvelope<Ticket>, undefined>(TICKET_ENDPOINTS.checkIn(ticketId)),

  getAdminOverview: async () => crudRequest.get<ApiEnvelope<AdminOverview>>(ADMIN_ENDPOINTS.overview),

  getAdminUsers: async () => crudRequest.get<ApiEnvelope<User[]>>(ADMIN_ENDPOINTS.users),

  getAdminEvents: async () => crudRequest.get<ApiEnvelope<Event[]>>(ADMIN_ENDPOINTS.events),

  getAdminTransactions: async () => crudRequest.get<ApiEnvelope<Transaction[]>>(ADMIN_ENDPOINTS.transactions)
};
