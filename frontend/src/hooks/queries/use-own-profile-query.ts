"use client";

import { useQuery } from "@tanstack/react-query";
import { request } from "@/apiServices/requests";
import { queryKeys } from "@/lib/query-keys";
import { tokenService } from "@/apiServices/token-service";

export const useOwnProfileQuery = () =>
  useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => (await request.getOwnProfile()).data,
    enabled: Boolean(tokenService.getToken()),
    retry: false
  });
