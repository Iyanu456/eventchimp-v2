"use client";

import { useQuery } from "@tanstack/react-query";
import { request } from "@/apiServices/requests";
import { queryKeys } from "@/lib/query-keys";

export const useBrandingTemplatesQuery = (eventId?: string) =>
  useQuery({
    queryKey: [...queryKeys.dashboard.branding, eventId],
    queryFn: async () => (await request.getBrandingTemplates(eventId)).data
  });
