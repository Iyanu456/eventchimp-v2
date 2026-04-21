import bcrypt from "bcryptjs";
import { BrandingAssetMetadataModel } from "../models/BrandingAssetMetadata";
import { EventModel } from "../models/Event";
import { OrganizerProfileModel } from "../models/OrganizerProfile";
import { UserModel } from "../models/User";

const buildTicketTiers = (config: {
  basePrice: number;
  capacity: number;
  isFree?: boolean;
  premiumLabel?: string;
}) => {
  if (config.isFree || config.basePrice === 0) {
    return [
      {
        id: "free-pass",
        name: "Free pass",
        price: 0,
        quantity: Math.max(Math.floor(config.capacity * 0.9), 1),
        order: 0,
        perks: ["General event access", "Community networking"]
      }
    ];
  }

  return [
    {
      id: "general-admission",
      name: "General admission",
      price: config.basePrice,
      quantity: Math.max(Math.floor(config.capacity * 0.75), 1),
      order: 0,
      perks: ["Main event access", "Standard seating"]
    },
    {
      id: "vip-access",
      name: config.premiumLabel ?? "VIP access",
      price: Math.round(config.basePrice * 1.7),
      quantity: Math.max(Math.floor(config.capacity * 0.25), 1),
      order: 1,
      perks: ["Priority check-in", "Closer seating", "Organizer perks"]
    }
  ];
};

const backfillExistingEvents = async () => {
  const users = await UserModel.find({}, "_id email");
  const organizerUser = users.find((user) => user.email === "organizer@eventchimp.com");
  const organizerProfiles = await OrganizerProfileModel.find();

  await Promise.all(
    organizerProfiles.map(async (profile) => {
      if (organizerUser && String(profile.userId) === String(organizerUser._id)) {
        profile.payoutReady = true;
        profile.payoutStatus = "verified";
        profile.payoutProfile = {
          businessName: profile.payoutProfile.businessName || profile.displayName,
          bankCode: profile.payoutProfile.bankCode || "058",
          bankName: profile.payoutProfile.bankName || "Guaranty Trust Bank",
          accountNumber: profile.payoutProfile.accountNumber || "0123456789",
          accountName: profile.payoutProfile.accountName || profile.displayName,
          currency: "NGN",
          subaccountCode: profile.payoutProfile.subaccountCode || "ACCT_STUDIO_MAYA",
          subaccountId: profile.payoutProfile.subaccountId || 1,
          settlementSchedule: profile.payoutProfile.settlementSchedule || "AUTO",
          percentageCharge: 0,
          verifiedAt: profile.payoutProfile.verifiedAt || new Date(),
          reviewNote: profile.payoutProfile.reviewNote || ""
        } as never;
        await profile.save();
      }
    })
  );

  const events = await EventModel.find();
  if (!events.length) {
    return false;
  }

  const refreshedProfiles = await OrganizerProfileModel.find();
  const payoutByOrganizer = new Map(
    refreshedProfiles.map((profile) => [String(profile.userId), profile.payoutReady])
  );

  await Promise.all(
    events.map(async (event) => {
      const nextTiers =
        event.ticketTiers?.length
          ? event.ticketTiers
          : buildTicketTiers({
              basePrice: event.ticketPrice,
              capacity: event.capacity,
              isFree: event.isFree
            });

      const nextCustomFields =
        event.customFields?.length
          ? event.customFields
          : [
              {
                id: "institution",
                label: "School / organization",
                type: "text",
                required: false,
                placeholder: "Enter your school, branch, or chapter",
                options: []
              }
            ];

      event.set("ticketTiers", nextTiers);
      event.set("customFields", nextCustomFields);
      event.set("payoutReady", event.isFree ? false : Boolean(payoutByOrganizer.get(String(event.organizerId))));
      await event.save();
    })
  );

  return true;
};

export const seedDatabase = async () => {
  const hasExistingEvents = await backfillExistingEvents();
  if (hasExistingEvents) {
    return;
  }

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const [organizer, attendee, admin] = await UserModel.create([
    {
      name: "Maya Adewale",
      email: "organizer@eventchimp.com",
      passwordHash,
      role: "organizer"
    },
    {
      name: "Daniel Okafor",
      email: "attendee@eventchimp.com",
      passwordHash,
      role: "attendee"
    },
    {
      name: "Admin Chimp",
      email: "admin@eventchimp.com",
      passwordHash,
      role: "admin"
    }
  ]);

  await OrganizerProfileModel.create({
    userId: organizer._id,
    displayName: "Studio Maya",
    bio: "Design-forward private and brand experiences.",
    payoutReady: true,
    payoutStatus: "verified",
    payoutProfile: {
      businessName: "Studio Maya",
      bankCode: "058",
      bankName: "Guaranty Trust Bank",
      accountNumber: "0123456789",
      accountName: "Studio Maya",
      currency: "NGN",
      subaccountCode: "ACCT_STUDIO_MAYA",
      subaccountId: 1,
      settlementSchedule: "AUTO",
      percentageCharge: 0,
      verifiedAt: new Date(),
      reviewNote: ""
    }
  });

  const events = await EventModel.create([
    {
      organizerId: organizer._id,
      title: "Moonlight Rooftop Sessions",
      slug: "moonlight-rooftop-sessions",
      category: "Music",
      description:
        "A premium sunset-to-midnight rooftop experience with curated DJ sets, intimate lighting, and story-driven staging.",
      coverImage:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
      location: "Skyline Terrace, Lagos",
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10.25),
      capacity: 150,
      ticketPrice: 18000,
      isFree: false,
      status: "published",
      attendeesCount: 86,
      tags: ["rooftop", "dj", "premium"],
      ticketTiers: buildTicketTiers({
        basePrice: 18000,
        capacity: 150,
        premiumLabel: "Champagne deck"
      }),
      customFields: [
        {
          id: "guest-city",
          label: "City / area",
          type: "text",
          required: false,
          placeholder: "Where are you coming from?",
          options: []
        }
      ],
      payoutReady: true
    },
    {
      organizerId: organizer._id,
      title: "Founder Dinner: West Africa Builders",
      slug: "founder-dinner-west-africa-builders",
      category: "Networking",
      description:
        "A private dinner for operators, founders, and ecosystem partners focused on sharp conversation and strong room energy.",
      coverImage:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      location: "The Conservatory, Victoria Island",
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18.2),
      capacity: 70,
      ticketPrice: 25000,
      isFree: false,
      status: "published",
      attendeesCount: 33,
      tags: ["founders", "private", "dinner"],
      ticketTiers: buildTicketTiers({
        basePrice: 25000,
        capacity: 70,
        premiumLabel: "Founder circle"
      }),
      customFields: [
        {
          id: "company-name",
          label: "Company / team",
          type: "text",
          required: true,
          placeholder: "Enter company name",
          options: []
        }
      ],
      payoutReady: true
    },
    {
      organizerId: organizer._id,
      title: "City Creators Picnic",
      slug: "city-creators-picnic",
      category: "Lifestyle",
      description:
        "A relaxed daytime event for creators, photographers, and emerging tastemakers with photo moments and branded keepsakes.",
      coverImage:
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
      location: "Freedom Park, Lagos",
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28.3),
      capacity: 220,
      ticketPrice: 0,
      isFree: true,
      status: "published",
      attendeesCount: 142,
      tags: ["community", "creator", "outdoor"],
      ticketTiers: buildTicketTiers({
        basePrice: 0,
        capacity: 220,
        isFree: true
      }),
      customFields: [
        {
          id: "school-branch",
          label: "School / branch",
          type: "text",
          required: false,
          placeholder: "Enter your school or branch",
          options: []
        }
      ],
      payoutReady: false
    }
  ]);

  await BrandingAssetMetadataModel.create([
    {
      eventId: events[0]._id,
      type: "instagram_frame",
      customization: {
        eventName: events[0].title,
        date: "May 14",
        venue: events[0].location,
        organizerName: "Studio Maya",
        sponsorName: "Aether Audio",
        logo: "",
        accentColor: "#4F46E5"
      },
      previewUrl: "https://placehold.co/1200x800/E0E7FF/111111?text=Instagram+Frame"
    }
  ]);
};
