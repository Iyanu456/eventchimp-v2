"use client";

import { useQuery } from "@tanstack/react-query";
import { request } from "@/apiServices/requests";
import { queryKeys } from "@/lib/query-keys";

export const useAdminOverviewQuery = () =>
  useQuery({
    queryKey: queryKeys.admin.overview,
    queryFn: async () => (await request.getAdminOverview()).data
  });

export const useAdminUsersQuery = () =>
  useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: async () => (await request.getAdminUsers()).data
  });

export const useAdminEventsQuery = () =>
  useQuery({
    queryKey: queryKeys.admin.events,
    queryFn: async () => (await request.getAdminEvents()).data
  });

export const useAdminTransactionsQuery = () =>
  useQuery({
    queryKey: queryKeys.admin.transactions,
    queryFn: async () => (await request.getAdminTransactions()).data
  });
