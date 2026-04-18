export type UserRole = "attendee" | "organizer" | "admin";
export type EventStatus = "draft" | "published" | "sold_out" | "cancelled";
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
  } | null;
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
  ticketPrice: number;
  serviceFee: number;
  totalPaid: number;
  organizerShare: number;
  platformRevenue: number;
};

export type Ticket = {
  _id: string;
  paymentReference: string;
  paymentStatus: "pending" | "success" | "failed";
  qrCode: string;
  totalPaid: number;
  ticketPrice: number;
  serviceFee: number;
  checkedIn: boolean;
  checkedInAt?: string | null;
  eventId?: Event;
};

export type Transaction = {
  _id: string;
  providerReference: string;
  amount: number;
  ticketPrice: number;
  serviceFee: number;
  organizerShare: number;
  platformRevenue: number;
  status: "pending" | "success" | "failed";
  createdAt: string;
  eventId?: Pick<Event, "_id" | "title">;
  organizerId?: Pick<User, "id" | "name">;
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
  };
  events: Event[];
  transactions: Transaction[];
  guestList: Ticket[];
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
