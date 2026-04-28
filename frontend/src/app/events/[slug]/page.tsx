import { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventDetailClient } from "@/components/events/event-detail-client";
import { fetchEventBySlugServer, getEventPreviewImage, getSiteUrl, stripHtml, toAbsoluteUrl } from "@/lib/server-events";

type EventDetailPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const payload = await fetchEventBySlugServer(params.slug);
  const event = payload?.event;
  const title = event ? `${event.title} | EventChimp` : "EventChimp event";
  const description = event ? stripHtml(event.description).slice(0, 160) : "Discover premium event experiences on EventChimp.";
  const url = `${getSiteUrl()}/events/${params.slug}`;
  const image = getEventPreviewImage(event?.coverImage);

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: event?.title ?? "EventChimp event preview"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const payload = await fetchEventBySlugServer(params.slug);
  if (!payload) {
    notFound();
  }

  const { event } = payload;
  const canonicalUrl = `${getSiteUrl()}/events/${params.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: stripHtml(event.description),
    image: [getEventPreviewImage(event.coverImage)],
    url: canonicalUrl,
    startDate: event.startDate,
    endDate: event.endDate,
    eventAttendanceMode:
      event.attendanceMode === "virtual"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : event.attendanceMode === "hybrid"
          ? "https://schema.org/MixedEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
    location:
      event.attendanceMode === "virtual"
        ? {
            "@type": "VirtualLocation",
            url: event.streaming?.url || canonicalUrl
          }
        : {
            "@type": "Place",
            name: event.location,
            address: event.location
          },
    organizer: {
      "@type": "Organization",
      name: event.organizerId?.name ?? "EventChimp organizer",
      url: toAbsoluteUrl("/")
    },
    offers: event.ticketTiers.map((tier) => ({
      "@type": "Offer",
      price: tier.price,
      priceCurrency: "NGN",
      availability: "https://schema.org/InStock",
      url: `${canonicalUrl}/checkout`,
      category: tier.name
    }))
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <EventDetailClient data={payload} canonicalUrl={canonicalUrl} />
    </>
  );
}
