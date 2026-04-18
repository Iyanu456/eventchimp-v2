import bcrypt from "bcryptjs";
import { BrandingAssetMetadataModel } from "../models/BrandingAssetMetadata";
import { EventModel } from "../models/Event";
import { OrganizerProfileModel } from "../models/OrganizerProfile";
import { UserModel } from "../models/User";

export const seedDatabase = async () => {
  const eventsCount = await EventModel.countDocuments();
  if (eventsCount > 0) {
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
    bio: "Design-forward private and brand experiences."
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
      tags: ["rooftop", "dj", "premium"]
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
      tags: ["founders", "private", "dinner"]
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
      tags: ["community", "creator", "outdoor"]
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
