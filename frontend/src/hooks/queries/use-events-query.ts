"use client";

import { useQuery } from "@tanstack/react-query";
import { request } from "@/apiServices/requests";
import { queryKeys } from "@/lib/query-keys";

export const useEventsQuery = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: queryKeys.events.list(params),
    queryFn: async () => (await request.getEvents(params)).data
  });

export const useFeaturedEventsQuery = () =>
  useQuery({
    queryKey: queryKeys.events.featured,
    queryFn: async () => (await request.getFeaturedEvents()).data
  });

export const useEventQuery = (slug: string) =>
  useQuery({
    queryKey: queryKeys.events.detail(slug),
    queryFn: async () => (await request.getEventBySlug(slug)).data,
    enabled: Boolean(slug)
  });
