export type UserRole = "attendee" | "organizer" | "admin";
export type EventStatus = "draft" | "published" | "sold_out" | "cancelled";
export type ScheduleType = "single" | "recurring";
export type AttendanceMode = "in_person" | "virtual" | "hybrid";
export type RecurrenceFrequency = "daily" | "weekly" | "monthly";
export type CustomFieldType = "text" | "number" | "select";
export type BrandingAssetType =
  | "instagram_frame"
  | "wristband"
  | "badge_pass"
  | "sponsor_backdrop";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  provider: "local" | "google";
  organizerProfile?: {
    displayName: string;
    bio: string;
    payoutPlaceholder: string;
    profileImage: string;
    brandingPreferences: {
      accentColor: string;
      signatureTone: string;
    };
    payoutReady?: boolean;
    payoutStatus?: "not_started" | "pending_review" | "verified" | "rejected" | "suspended";
    riskStatus?: "clear" | "under_review" | "blocked";
    payoutProfile?: {
      businessName: string;
      bankCode: string;
      bankName: string;
      accountNumber: string;
      accountName: string;
      currency: string;
      subaccountCode: string;
      settlementSchedule: string;
      reviewNote: string;
    };
  } | null;
};

export type TicketTier = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  order: number;
  perks: string[];
};

export type EventRecurrence = {
  frequency: RecurrenceFrequency;
  interval: number;
  until?: string | null;
  daysOfWeek: string[];
};

export type EventStreaming = {
  provider: string;
  url?: string;
  meetingCode?: string;
  password?: string;
  notes?: string;
};

export type EventGuest = {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
  bio?: string;
};

export type EventCustomField = {
  id: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  placeholder?: string;
  options: string[];
};

export type Event = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  coverImage: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  ticketPrice: number;
  isFree: boolean;
  status: EventStatus;
  attendeesCount: number;
  tags: string[];
  scheduleType?: ScheduleType;
  recurrence?: EventRecurrence | null;
  attendanceMode?: AttendanceMode;
  streaming?: EventStreaming | null;
  ticketTiers: TicketTier[];
  guests: EventGuest[];
  customFields: EventCustomField[];
  payoutReady?: boolean;
  accessStatus?: "active" | "suspended";
  riskStatus?: "clear" | "under_review" | "blocked";
  suspensionReason?: string;
  organizerId?: {
    _id: string;
    name: string;
    avatar?: string;
  };
};

export type EventMessage = {
  _id: string;
  content: string;
  guestName?: string;
  createdAt: string;
  userId?: {
    _id: string;
    name: string;
    avatar?: string;
  } | null;
};

export type PricingBreakdown = {
  ticketSubtotal: number;
  organizerNetAmount: number;
  estimatedTransactionFee: number;
  estimatedTransferFee: number;
  estimatedStampDuty: number;
  platformMargin: number;
  serviceFee: number;
  buyerTotal: number;
};

export type CheckoutAnswer = {
  fieldId: string;
  label: string;
  value: string;
};

export type Ticket = {
  _id: string;
  paymentReference: string;
  paymentStatus: "pending" | "success" | "failed" | "refunded";
  status?: "issued" | "checked_in" | "refunded" | "voided";
  ticketCode?: string;
  qrCode: string;
  totalPaid: number;
  ticketPrice: number;
  serviceFee: number;
  ticketTypeId?: string;
  ticketTypeName?: string;
  attendeeFirstName?: string;
  attendeeLastName?: string;
  attendeeEmail?: string;
  attendeePhone?: string;
  orderReference?: string;
  customAnswers?: CheckoutAnswer[];
  comment?: string;
  checkedIn: boolean;
  checkedInAt?: string | null;
  checkedInBy?: string | null;
  eventId?: Event;
};

export type Transaction = {
  _id: string;
  providerReference: string;
  amount: number;
  quantity: number;
  ticketPrice: number;
  ticketSubtotal?: number;
  serviceFee: number;
  organizerShare: number;
  organizerNetAmount?: number;
  platformRevenue: number;
  buyerTotal?: number;
  estimatedTransactionFee?: number;
  estimatedTransferFee?: number;
  estimatedStampDuty?: number;
  platformMargin?: number;
  ticketTypeId?: string;
  ticketTypeName?: string;
  attendeeFirstName?: string;
  attendeeLastName?: string;
  attendeeEmail?: string;
  attendeePhone?: string;
  comment?: string;
  customAnswers?: CheckoutAnswer[];
  status: "pending" | "success" | "failed" | "refunded";
  paymentStatus?: "initialized" | "pending" | "paid" | "failed" | "refunded" | "cancelled";
  fulfillmentStatus?: "pending" | "processing" | "fulfilled" | "failed" | "refunded";
  settlementStatus?: "pending" | "reconciled" | "mismatch" | "refunded";
  createdAt: string;
  eventId?: Pick<Event, "_id" | "title">;
  organizerId?: Pick<User, "id" | "name">;
};

export type PayoutBank = {
  name: string;
  code: string;
};

export type PayoutStatus = {
  payoutReady: boolean;
  payoutStatus: "not_started" | "pending_review" | "verified" | "rejected" | "suspended";
  riskStatus: "clear" | "under_review" | "blocked";
  businessName: string;
  bankCode: string;
  bankName: string;
  accountNumberMasked: string;
  accountName: string;
  currency: string;
  subaccountCode: string;
  settlementSchedule: string;
  reviewNote: string;
  organizerNotifications?: {
    ticketPurchaseEmail: boolean;
  };
};

export type EventCollaborator = {
  id: string;
  role: "owner" | "manager" | "scanner" | "viewer";
  acceptedAt?: string | Date | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  } | null;
};

export type EventInvitation = {
  id: string;
  email: string;
  role: "manager" | "scanner" | "viewer";
  status: "pending" | "accepted" | "revoked" | "expired";
  expiresAt: string;
};

export type EventCollaboratorResponse = {
  currentRole: "owner" | "manager" | "scanner" | "viewer" | "admin";
  collaborators: EventCollaborator[];
  invitations: EventInvitation[];
};

export type EventMetrics = {
  accessLevel: "full" | "scanner";
  totalTicketsSold: number;
  totalOrders: number;
  checkIns: number;
  checkInRate: number;
  remainingGuests: number;
  ticketTierBreakdown: Array<{
    ticketTypeId: string;
    ticketTypeName: string;
    ticketsSold: number;
    grossRevenue: number;
    organizerNetRevenue: number;
    serviceFees: number;
  }>;
  salesTimeline: Array<{
    date: string;
    totalOrders: number;
    totalTicketsSold: number;
    grossRevenue: number;
    organizerNetRevenue: number;
    serviceFees: number;
  }>;
  grossRevenue?: number;
  organizerNetRevenue?: number;
  serviceFees?: number;
  refunds?: {
    count: number;
    amount: number;
  };
};

export type RefundRecord = {
  _id: string;
  orderId: string;
  amount: number;
  currency: string;
  includeServiceFee: boolean;
  status: "requested" | "processing" | "succeeded" | "failed" | "rejected";
  reason: string;
  merchantNote?: string;
  processedAt?: string | null;
};

export type BrandingTemplate = {
  event: Event;
  assets: Array<{
    _id: string;
    type: BrandingAssetType;
    customization: {
      eventName: string;
      date: string;
      venue: string;
      organizerName: string;
      sponsorName?: string;
      logo?: string;
      accentColor: string;
    };
    previewUrl: string;
  }>;
};

export type EventsResponse = {
  items: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type EventDetailResponse = {
  event: Event;
  messages: EventMessage[];
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type OrganizerDashboard = {
  metrics: {
    eventsCount: number;
    attendeesCount: number;
    revenue: number;
    platformRevenue: number;
    buyerPaidServiceFees: number;
  };
  events: Event[];
  transactions: Transaction[];
  guestList: Ticket[];
  payout: PayoutStatus | null;
  settlement: {
    pendingCount: number;
    mismatchCount: number;
  };
};

export type AdminOverview = {
  metrics: {
    usersCount: number;
    eventsCount: number;
    transactionsCount: number;
    grossRevenue: number;
  };
  recentUsers: User[];
  recentEvents: Event[];
  recentTransactions: Transaction[];
};
